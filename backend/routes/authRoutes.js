const express = require('express');
const router = express.Router();
const { register, login, updateLocation, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.put('/location', verifyToken, updateLocation);

module.exports = router;
