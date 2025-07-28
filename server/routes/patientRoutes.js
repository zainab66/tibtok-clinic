const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth'); // Import your authentication middleware


// Apply authentication middleware to all patient routes that require it
// For read-all, you might choose to make it public or restricted.
// For this example, all patient operations are restricted.

// CREATE patient
router.post('/', authenticateToken,  async (req, res) => {
    const {
        first_name,
        last_name,
        birth_date,
        sex,
        phone,
        email,
        address,
        status,
        // created_by will now come from req.user.id
    } = req.body;

    const created_by= req.user.id; // Get user ID from the authenticated token

    // Validate required fields (created_by is now implicitly handled by authentication)
    if (!first_name || !last_name || !phone || !status) {
        return res.status(400).json({ message: 'Required fields: first_name, last_name, phone, status' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO patients (
                first_name,
                last_name,
                birth_date,
                sex,
                phone,
                email,
                address,
                status,
                last_visit,
                created_by
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9)
               RETURNING *`,
            [
                first_name,
                last_name,
                birth_date,
                sex,
                phone,
                email,
                address,
                status,
                created_by// Use the authenticated user's ID
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create patient.' });
    }
});

// GET all patients for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    const created_by= req.user.id; // Get user ID from the authenticated token
    try {
        const result = await pool.query('SELECT * FROM patients WHERE created_by = $1 ORDER BY created_at DESC', [created_by]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch patients.' });
    }
});

// GET single patient by ID (only if created by the logged-in user)
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const created_by= req.user.id; // Get user ID from the authenticated token

    try {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1 AND created_by = $2', [id, created_by]);
        if (result.rows.length === 0) {
            // Return 404 if not found OR if not created by the current user
            return res.status(404).json({ message: 'Patient not found or you do not have access to this patient.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch patient.' });
    }
});

// UPDATE patient (only if created by the logged-in user)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const {
        first_name,
        last_name,
        birth_date,
        sex,
        phone,
        email,
        address,
        status
    } = req.body;

    const created_by= req.user.id; // Get user ID from the authenticated token

    // Validate required fields
    if (!first_name || !last_name || !phone || !status) {
        return res.status(400).json({ message: 'Required fields: first_name, last_name, phone, status' });
    }

    try {
        const result = await pool.query(
            `UPDATE patients SET
                first_name = $1,
                last_name = $2,
                birth_date = $3,
                sex = $4,
                phone = $5,
                email = $6,
                address = $7,
                status = $8,
                last_visit = CURRENT_DATE
               WHERE id = $9 AND created_by = $10
               RETURNING *`,
            [
                first_name,
                last_name,
                birth_date,
                sex,
                phone,
                email,
                address,
                status,
                id,
                created_by// Ensure only the owner can update
            ]
        );

        if (result.rows.length === 0) {
            // Return 404 if not found OR if not created by the current user
            return res.status(404).json({ message: 'Patient not found or you do not have permission to update this patient.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update patient.' });
    }
});

// DELETE patient (only if created by the logged-in user)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const created_by= req.user.id; // Get user ID from the authenticated token

    try {
        const result = await pool.query('DELETE FROM patients WHERE id = $1 AND created_by = $2 RETURNING *', [id, created_by]);
        if (result.rows.length === 0) {
            // Return 404 if not found OR if not created by the current user
            return res.status(404).json({ message: 'Patient not found or you do not have permission to delete this patient.' });
        }
        res.status(200).json({ message: 'Patient deleted.', patient: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete patient.' });
    }
});

module.exports = router;