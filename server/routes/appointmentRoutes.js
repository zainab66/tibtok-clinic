const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth'); // Add authentication middleware

// CREATE appointment - protected and associated with logged-in user
router.post('/', auth, async (req, res) => {
  const { patient_id, appointment_date, appointment_time, reason, status } = req.body;

  // Get user ID from auth middleware
  const created_by = req.user.id;

  if (!patient_id || !appointment_date || !appointment_time || !reason) {
    return res.status(400).json({ message: 'Required fields: patient_id, appointment_date, appointment_time, reason' });
  }

  try {
    // Verify the patient belongs to the user
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
      [patient_id, created_by]
    );
    
    if (patientCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Patient not found or not authorized' });
    }

    const result = await pool.query(
      `INSERT INTO appointments 
       (patient_id, appointment_date, appointment_time, reason, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        patient_id,
        appointment_date,
        appointment_time,
        reason,
        status || 'scheduled',
        created_by
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create appointment.' });
  }
});

// GET all appointments for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name, 
           CONCAT(p.first_name, ' ', p.last_name) as patient_name 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.created_by = $1
      ORDER BY a.appointment_date, a.appointment_time
    `, [req.user.id]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch appointments.' });
  }
});

// GET appointments by patient ID - verify patient belongs to user
router.get('/patient/:patient_id', auth, async (req, res) => {
  const { patient_id } = req.params;
  try {
    // First verify the patient belongs to the user
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
      [patient_id, req.user.id]
    );
    
    if (patientCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Patient not found or not authorized' });
    }

    const result = await pool.query(
      `SELECT a.* FROM appointments a
       WHERE a.patient_id = $1 AND a.created_by = $2
       ORDER BY a.appointment_date, a.appointment_time`,
      [patient_id, req.user.id]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch appointments for patient.' });
  }
});

// GET single appointment by ID - verify it belongs to user
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name,
             CONCAT(p.first_name, ' ', p.last_name) as patient_name 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1 AND a.created_by = $2
    `, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not authorized.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch appointment.' });
  }
});

// UPDATE appointment - verify it belongs to user
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { patient_id, appointment_date, appointment_time, reason, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE appointments 
       SET 
         patient_id = COALESCE($1, patient_id),
         appointment_date = COALESCE($2, appointment_date),
         appointment_time = COALESCE($3, appointment_time),
         reason = COALESCE($4, reason),
         status = COALESCE($5, status),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND created_by = $7
       RETURNING *`,
      [
        patient_id,
        appointment_date,
        appointment_time,
        reason,
        status,
        id,
        req.user.id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not authorized.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update appointment.' });
  }
});

// DELETE appointment - verify it belongs to user
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 AND created_by = $2 RETURNING *', 
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found or not authorized.' });
    }
    res.status(200).json({ message: 'Appointment deleted.', appointment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete appointment.' });
  }
});

module.exports = router;