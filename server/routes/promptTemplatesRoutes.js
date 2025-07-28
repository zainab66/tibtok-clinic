const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth'); // Import your authentication middleware


router.post('/', async (req, res) => {
  // Validate required fields
  const { template_type, template_slug, template_content, created_by } = req.body;
  
  if (!template_type || !template_slug || !template_content || !created_by) {
    return res.status(400).json({ 
      error: "All fields (template_type, template_slug, template_content, created_by) are required" 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO prompt_templates 
       (template_type, template_slug, template_content, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [template_type, template_slug, template_content, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: "Template slug already exists",
        details: `Slug '${template_slug}' is already in use`
      });
    }
    
    res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


// GET all prompt templates
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to query database...'); // Debug log
    const result = await pool.query('SELECT * FROM prompt_templates ORDER BY created_at DESC');
    console.log('Query successful, rows:', result.rows.length); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});




module.exports = router;
