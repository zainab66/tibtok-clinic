const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken'); // Optional if you want to add JWT later


// REGISTER
router.post('/register', async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    organization_name,
    organization_country
  } = req.body;

  if (!first_name || !last_name || !email || !password || !organization_country || !organization_name) {
    return res.status(400).json({ message: 'All user and organization fields are required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create organization
    const orgResult = await client.query(
      `INSERT INTO organizations (name, country) 
       VALUES ($1, $2) 
       RETURNING id, name, country`,
      [organization_name, organization_country || null]
    );
    const organization = orgResult.rows[0];

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const userResult = await client.query(
      `INSERT INTO users 
       (first_name, last_name, email, password_hash, organization_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, organization_id`,
      [first_name, last_name, email, hashedPassword, organization.id]
    );
    const user = userResult.rows[0];

    // 4. Update organization owner_id
    await client.query(
      `UPDATE organizations SET owner_id = $1 WHERE id = $2`,
      [user.id, organization.id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'User and organization created',
      user,
      organization: {
        ...organization,
        owner_id: user.id
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error creating user and organization' });
  } finally {
    client.release();
  }
});




// LOGIN with JWT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const jwtid = require('uuid').v4(); // Generate a unique ID for this token
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, jti: jwtid }, // <-- ADD jti HERE
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in user' });
  }
});






// LOGOUT - Token Invalidation
router.post('/logout', async (req, res) => {
  try {
    // Option 1: Simple token expiration (client-side handling)
    // Just return success - actual invalidation happens client-side
    
    // Option 2: Token blacklisting (more secure)
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // Verify token to get its claims (including jti)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add token to blacklist (store in DB or Redis)
      // Example with PostgreSQL:
      await pool.query(
        'INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, $2)',
        [decoded.jti, new Date(decoded.exp * 1000)]
      );
    }
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    // Even if token is invalid/expired, consider logout successful
    if (err.name === 'JsonWebTokenError') {
      return res.status(200).json({ message: 'Logout successful' });
    }
    console.error(err);
    res.status(500).json({ message: 'Error during logout' });
  }
});




module.exports = router;
