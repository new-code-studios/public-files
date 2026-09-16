const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deploymentController');
const { authMiddleware } = require('../middleware/auth');
const { validateInput } = require('../middleware/validation');
const upload = require('../middleware/upload');

router.use(authMiddleware);

// Create Deployment
router.post('/', upload.single('code'), validateInput('deployment'), deploymentController.createDeployment);

// Get Deployment Status
router.get('/:id', deploymentController.getDeploymentStatus);

// List User Deployments
router.get('/', deploymentController.listDeployments);

// Cancel Deployment
router.delete('/:id', deploymentController.cancelDeployment);

module.exports = router;
