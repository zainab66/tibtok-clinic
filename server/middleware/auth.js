// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Fix: assign the whole decoded payload (not decoded.user)
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
