const { google } = require('googleapis');
const logger = require('../utils/logger');
const db = require('../db/connection');

const searchconsole = google.webmasters('v3');

exports.getAuthorizationUrl = async (req, res, next) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/webmasters',
        'https://www.googleapis.com/auth/webmasters.readonly'
      ],
      prompt: 'consent'
    });

    res.json({ authorization_url: authUrl });
  } catch (error) {
    logger.error('Authorization URL error:', error);
    next(error);
  }
};

exports.getProperties = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user's GSC tokens from database
    const userTokens = await db.query(
      'SELECT gsc_access_token, gsc_refresh_token FROM users WHERE id = $1',
      [userId]
    );

    if (userTokens.rows.length === 0 || !userTokens.rows[0].gsc_access_token) {
      return res.status(401).json({ error: 'GSC not connected' });
    }

    // Create OAuth2 client with user's tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userTokens.rows[0].gsc_access_token,
      refresh_token: userTokens.rows[0].gsc_refresh_token
    });

    // Fetch properties from Google Search Console
    const response = await searchconsole.sites.list({
      auth: oauth2Client
    });

    res.json({
      properties: response.data.siteEntry || [],
      count: (response.data.siteEntry || []).length
    });
  } catch (error) {
    logger.error('Get properties error:', error);
    next(error);
  }
};

exports.getPerformance = async (req, res, next) => {
  try {
    const { property, days = 30, startRow = 0 } = req.query;
    const userId = req.user.id;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const userTokens = await db.query(
      'SELECT gsc_access_token FROM users WHERE id = $1',
      [userId]
    );

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: userTokens.rows[0].gsc_access_token
    });

    const response = await searchconsole.searchanalytics.query({
      siteUrl: property,
      auth: oauth2Client,
      requestBody: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        rowLimit: 25000,
        startRow: parseInt(startRow)
      }
    });

    res.json({
      data: response.data.rows || [],
      totals: response.data.responseAggregatedBy || null
    });
  } catch (error) {
    logger.error('Get performance error:', error);
    next(error);
  }
};

exports.verifyDomain = async (req, res, next) => {
  try {
    const { property_url, method } = req.body;
    const userId = req.user.id;

    // Store verification request
    const result = await db.query(
      'INSERT INTO verifications (user_id, property_url, method, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, verification_code',
      [userId, property_url, method]
    );

    res.json({
      verification_id: result.rows[0].id,
      verification_code: result.rows[0].verification_code,
      message: `Use method: ${method}`,
      status: 'pending'
    });
  } catch (error) {
    logger.error('Verify domain error:', error);
    next(error);
  }
};

exports.getVerificationStatus = async (req, res, next) => {
  try {
    const { property } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM verifications WHERE user_id = $1 AND property_url = $2 ORDER BY created_at DESC LIMIT 1',
      [userId, property]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No verification record found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get verification status error:', error);
    next(error);
  }
};
