const express = require('express');
const router = express.Router();
const gscController = require('../controllers/gscController');
const { authMiddleware } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');

// All routes require authentication
router.use(authMiddleware);

// Get GSC Authorization URL
router.get('/connect', gscController.getAuthorizationUrl);

// Get Verified Properties
router.get('/properties', gscController.getProperties);

// Get Performance Data
router.get('/performance', validateInput('performance'), gscController.getPerformance);

// Verify Domain Ownership
router.post('/verify', validateInput('verify'), gscController.verifyDomain);

// Get Verification Status
router.get('/verify-status/:property', gscController.getVerificationStatus);

module.exports = router;
