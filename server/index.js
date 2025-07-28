const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes//appointmentRoutes');
const sessionsRouter = require('./routes/sessionsRoutes');
const promptTemplatesRoutes = require('./routes/promptTemplatesRoutes');
const path = require('path');

const dotenv = require('dotenv');

dotenv.config(); // Load environment variables
const port = process.env.PORT || 3000; // fallback to 3000 if .env is missing




//middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//ROUTES//
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/sessions', sessionsRouter);
app.use('/api/prompt-templates', promptTemplatesRoutes);

 // Audio routes
app.use('/get-audio', express.static(path.join(__dirname, 'audio_uploads')));








// Export for Vercel
module.exports = app;

// Start server
// Only start server locally
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
