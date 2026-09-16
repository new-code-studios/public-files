const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateInput } = require('../middleware/validation');

// User Registration
router.post('/register', validateInput('register'), authController.register);

// User Login
router.post('/login', validateInput('login'), authController.login);

// Google OAuth Callback
router.post('/gsc/callback', authController.gscCallback);

// Refresh Token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

module.exports = router;
