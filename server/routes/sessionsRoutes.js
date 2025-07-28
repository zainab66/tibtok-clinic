require('dotenv').config(); // Add this at the very top
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const { buildSystemPrompt } = require('../helpers/promptBuilder');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
router.use(express.json()); // Ensure JSON body parsing
const authenticateUser = require('../middleware/auth');

const { getAudioDurationInSeconds } = require('get-audio-duration');

const getDuration = async (filePath) => {
  try {
    return await getAudioDurationInSeconds(filePath);
  } catch (err) {
    console.error('❌ Error getting audio duration:', err.message);
    return 0;
  }
};


// 1. Configure paths at top of file
const AUDIO_UPLOADS_DIR = path.join(__dirname, '..', 'audio_uploads');


const upload = multer({ dest: 'uploads/' });


// Get template HTML from DB based on slug
const getTemplateHtml = async (slug, userId) => {
  try {
    const result = await pool.query(
      `SELECT template_content FROM prompt_templates WHERE template_slug = $1 LIMIT 1`,
      [slug]
    );

    if (result.rows.length === 0) {
      throw new Error(`Template not found for slug: ${slug}`);
    }

    return result.rows[0].template_content;
  } catch (err) {
    console.error('❌ Failed to fetch template from DB:', err.message);
    throw err;
  }
};


const getUserPreferences = async (userId) => {
  // Return mock preferences
  return `User preferences for user ${userId}: concise format, formal tone.`;
};

const saveVoiceLog = async ({ user_id, session_id, patient_id, transcript, ai_summary, template, audio_path }) => {
  try {
    const query = `
      INSERT INTO sessions (user_id, session_id, patient_id, audio_file, transcript, template, ai_summary, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
      RETURNING *;
    `;
    // Ensure the order here EXACTLY matches the column order in the INSERT query
    const values = [user_id, session_id, patient_id, audio_path, transcript, template, ai_summary];
    const result = await pool.query(query, values);
    console.log('✅ Session log saved to DB:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error saving session log to DB:', error);
    throw error;
  }
};





router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const { patient_id, language = 'en-US', template, session_id, user_id } = req.body;
  console.log('Request Body:', req.body);

  const missingFields = [];
  if (!file) missingFields.push('audio file');
  if (!patient_id) missingFields.push('patient_id');
  if (!session_id) missingFields.push('session_id');
  if (!user_id) missingFields.push('user_id');
  if (!template) missingFields.push('template');

  const validLanguages = ['en-US', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ar'];
  if (language && !validLanguages.includes(language)) {
    console.error('Invalid language code:', language);
    return res.status(400).json({ error: 'Invalid language code provided', valid_languages: validLanguages });
  }

  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return res.status(400).json({ error: 'Missing required fields', missing: missingFields });
  }

  console.log('🟢 File uploaded:', file.path);

  try {
    const stats = await fs.stat(file.path);
    if (stats.size === 0) {
      console.error('❌ Uploaded audio file is empty.');
      await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: 'Uploaded audio file is empty' });
    }

   // 🔍 Check duration
    const duration = await getDuration(file.path);
    console.log('📏 Audio duration:', duration);
    if (!duration || duration < 1.0) {
      console.error('❌ Audio too short or silent.');
      await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: 'Audio too short or silent' });
    }

    const audioData = await fs.readFile(file.path);

    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('❌ Deepgram API key not configured');
      return res.status(500).json({ error: 'Server configuration error: Missing Deepgram API key' });
    }

    const validMimeTypes = ['audio/webm', 'audio/mpeg', 'audio/wav'];
    if (!validMimeTypes.includes(file.mimetype)) {
      console.error('❌ Invalid file type:', file.mimetype);
      return res.status(400).json({ error: 'Invalid file type', supported_types: validMimeTypes });
    }

    // 1️⃣ Send to Deepgram
    console.log('🔵 Sending audio to Deepgram...');
    const dgResp = await axios.post(
      `https://api.deepgram.com/v1/listen?language=${language}&model=whisper`,
      audioData,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm',
        }
      }
    );

    const transcript = dgResp.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
    console.log('✅ Transcript:', transcript);

    // 🚫 Block garbage transcripts
    const bannedPhrases = ['اشتركوا في القناة', 'لا تنسوا الاشتراك',  'Subscribe to the channel',
  "Don't forget to subscribe"];
    if (!transcript || transcript.trim().length === 0 || bannedPhrases.some(p => transcript.includes(p))) {
      console.error('❌ Transcript invalid or garbage.');
      await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: 'Transcript invalid or empty' });
    }

    // 2️⃣ Get template and preferences
    const templateHtml = await getTemplateHtml(template, user_id);
    const preferencesText = await getUserPreferences(user_id);
    console.log('✅ Template and preferences fetched');

    // 3️⃣ Build prompt and send to DeepSeek
    const systemPrompt = buildSystemPrompt({
      templateHtml,
      preferencesText,
      patient: patient_id,
      language,
      transcript
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `TRANSCRIPT:\n\n${transcript}` },
    ];

    console.log('🟡 Sending to DeepSeek...');
    const dsResp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages,
        temperature: 0.0,
        max_tokens: 8000,
        stop: ['```']
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const summary = dsResp.data?.choices?.[0]?.message?.content || '[No summary]';
    console.log('✅ Summary:', summary);

    // 4️⃣ Move file to permanent location
    await fs.mkdir(AUDIO_UPLOADS_DIR, { recursive: true });
    const newFilename = `audio-${Date.now()}${path.extname(file.originalname)}`;
    const newPath = path.join(AUDIO_UPLOADS_DIR, newFilename);
    await fs.rename(file.path, newPath);

    // 5️⃣ Save session
    await saveVoiceLog({
      user_id,
      session_id,
      patient_id,
      transcript,
      ai_summary: summary,
      template,
      audio_path: newPath
    });

    res.json({
      transcript,
      summary,
      audio_url: `/get-audio/${newFilename}`
    });

  } catch (err) {
    console.error('❌ Processing error:', err);
    if (file) {
      await fs.unlink(file.path).catch(() => {});
    }
    res.status(500).json({
      error: 'Processing failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});











// GET /api/sessions?patientId=xxx
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.query;
    const userId = req.user.id; // From token

    // You might want to ensure the user has access to this patient
  const query = patientId
  ? `SELECT * FROM sessions WHERE patient_id = $1 AND user_id = $2 ORDER BY created_at DESC`
  : `SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC`;

const params = patientId ? [patientId, userId] : [userId];

const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Session not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// PUT /api/sessions/:id
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if this session belongs to the authenticated user
    const sessionCheck = await pool.query(
      'SELECT * FROM sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (sessionCheck.rows.length === 0)
      return res.status(403).json({ message: 'Not authorized to update this session' });

    const { transcript, template, ai_summary, status, completed_at } = req.body;

    const result = await pool.query(
      `UPDATE sessions
       SET transcript = $1, template = $2, ai_summary = $3, status = $4, completed_at = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [transcript, template, ai_summary, status, completed_at, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update session' });
  }
});



// DELETE /api/sessions/:id
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure the session belongs to the authenticated user
    const result = await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, userId]
    );

    if (result.rows.length === 0)
      return res.status(403).json({ message: 'Not authorized or session not found' });

    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});









// 1. The upload route (you already have most of this)
router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  const file = req.file;
  
  // Ensure the directory exists using fs.promises.mkdir
  await fs.mkdir(AUDIO_UPLOADS_DIR, { recursive: true });

  // Save to audio_uploads with better filename
  const newFilename = `audio-${Date.now()}${path.extname(file.originalname)}`;
  const newPath = path.join(AUDIO_UPLOADS_DIR, newFilename); // Use AUDIO_UPLOADS_DIR

  // Use fs.promises.rename for async operation
  await fs.rename(file.path, newPath); 
  
  res.json({
    message: "Audio uploaded!",
    audioUrl: `/get-audio/${newFilename}`
  });
});

// 2. The play audio route (NEW - add this)
router.get('/get-audio/:filename', (req, res) => {
  // Use AUDIO_UPLOADS_DIR for consistency
  const filePath = path.join(AUDIO_UPLOADS_DIR, req.params.filename); 
  
  // fs.existsSync is synchronous and fine here, or use fs.promises.access if you prefer async
  if (!require('fs').existsSync(filePath)) { // Use original fs for existsSync
    return res.status(404).send('Audio not found');
  }
  
  res.sendFile(filePath);
});

module.exports = router;
