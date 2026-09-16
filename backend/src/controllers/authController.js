const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const db = require('../db/connection');
const logger = require('../utils/logger');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

exports.register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      'INSERT INTO users (email, username, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, username',
      [email, username, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    });
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

exports.gscCallback = async (req, res, next) => {
  try {
    const { code, state } = req.body;
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens to database for user
    // Implementation depends on your session/user management

    res.json({
      success: true,
      message: 'GSC connected successfully',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expiry_date
      }
    });
  } catch (error) {
    logger.error('GSC callback error:', error);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newToken = jwt.sign({ userId: decoded.userId, email: decoded.email }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  // Implement token blacklisting or session termination
  res.json({ success: true, message: 'Logged out successfully' });
};
