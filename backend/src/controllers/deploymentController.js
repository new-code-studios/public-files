const db = require('../db/connection');
const logger = require('../utils/logger');
const { deploymentQueue } = require('../services/deploymentQueue');

exports.createDeployment = async (req, res, next) => {
  try {
    const { app_name, description, git_repo, property_url, target_platform } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Validate required fields
    if (!app_name || !property_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert deployment record
    const result = await db.query(
      `INSERT INTO deployments 
       (user_id, app_name, description, git_repo, property_url, target_platform, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'queued', NOW()) 
       RETURNING id, status`,
      [userId, app_name, description, git_repo, property_url, target_platform]
    );

    const deploymentId = result.rows[0].id;

    // Queue deployment job
    await deploymentQueue.enqueue({
      deploymentId,
      userId,
      app_name,
      git_repo,
      property_url,
      target_platform,
      file: file ? file.path : null
    });

    res.status(201).json({
      deployment_id: deploymentId,
      status: 'queued',
      message: 'Deployment queued successfully'
    });
  } catch (error) {
    logger.error('Create deployment error:', error);
    next(error);
  }
};

exports.getDeploymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM deployments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get deployment status error:', error);
    next(error);
  }
};

exports.listDeployments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      'SELECT * FROM deployments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      deployments: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    logger.error('List deployments error:', error);
    next(error);
  }
};

exports.cancelDeployment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'UPDATE deployments SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      ['cancelled', id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json({ deployment: result.rows[0], message: 'Deployment cancelled' });
  } catch (error) {
    logger.error('Cancel deployment error:', error);
    next(error);
  }
};
