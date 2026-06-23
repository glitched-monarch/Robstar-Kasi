const express = require('express');
const router = express.Router();
const { query } = require('../db/pg');
const { hashPassword, comparePassword } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

// Rate limiter for auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all auth routes (or just login, but we'll apply to all for safety)
router.use(authLimiter);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with phone and password
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // Find user by phone and whitelisted
    const userResult = await query(
      'SELECT * FROM users WHERE phone = $1 AND whitelisted = true',
      [phone]
    );

    if (userResult.rowCount === 0) {
      // Also increment failed attempts for non-existing user to prevent user enumeration
      // We'll do a dummy comparison to take similar time
      await comparePassword('dummy', '$2a$12$dummyhash');
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const user = userResult.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(401).json({ error: 'Account is locked due to too many failed attempts. Try again later.' });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      // Increment failed login attempts
      await query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
        [user.id]
      );

      // Lock account after 5 failed attempts
      const updateResult = await query(
        'SELECT failed_login_attempts FROM users WHERE id = $1',
        [user.id]
      );
      const attempts = updateResult.rows[0].failed_login_attempts;
      if (attempts >= 5) {
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 30); // Lock for 30 minutes
        await query(
          'UPDATE users SET locked_until = $1 WHERE id = $2',
          [lockedUntil, user.id]
        );
      }

      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Reset failed login attempts on successful login
    await query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
      [user.id]
    );

    // Store user in session (assuming session middleware is set up)
    req.session.user = {
      id: user.id,
      name: user.name,
      business_name: user.business_name,
      phone: user.phone,
      role: user.role
    };

    // Return user data (without password hash)
    const { password_hash, ...userWithoutHash } = user;
    res.json(userWithoutHash);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Log out user by destroying session
 * @access Private
 */
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid'); // Adjust cookie name if needed
    res.json({ success: true });
  });
});

/**
 * @route POST /api/auth/change-password
 * @desc Change password for logged in user
 * @access Private
 */
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    // Validate new password length (optional)
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const userId = req.session.user.id;

    // Get user's current password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const hash = userResult.rows[0].password_hash;

    // Verify current password
    const isMatch = await comparePassword(currentPassword, hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user's profile
 * @access Private
 */
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

/**
 * @route POST /api/admin/users
 * @desc Admin route to create a new buyer user with initial password
 * @access Private (admin only)
 */
router.post('/admin/users', async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, business_name, phone, password } = req.body;

    if (!name || !business_name || !phone || !password) {
      return res.status(400).json({ error: 'Name, business name, phone, and password are required' });
    }

    // Validate phone format (simple Kenyan phone pattern)
    const phonePattern = /^07[0-9]{8}$/;
    if (!phonePattern.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if phone already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: 'Phone number already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const id = uuidv4();
    await query(
      `INSERT INTO users (id, name, business_name, phone, role, password_hash, whitelisted)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, business_name, phone, 'buyer', passwordHash, true]
    );

    // Fetch the created user (without password)
    const userResult = await query(
      'SELECT id, name, business_name, phone, role, whitelisted, created_at FROM users WHERE id = $1',
      [id]
    );

    res.status(201).json(userResult.rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /api/admin/users/:id/reset-password
 * @desc Admin route to reset a user's password (generates a temporary one)
 * @access Private (admin only)
 */
router.post('/admin/users/:id/reset-password', async (req, res) => {
  try {
    // Check if user is admin
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const userId = req.params.id;

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8); // 8 char random string
    const hashedTempPassword = await hashPassword(tempPassword);

    // Update user's password and reset failed attempts
    await query(
      `UPDATE users
       SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL
       WHERE id = $2`,
      [hashedTempPassword, userId]
    );

    // In a real app, you would send the temporary password to the user via a secure channel
    // For this API, we return it (in production, do not return the password!)
    res.json({
      success: true,
      message: 'Password has been reset. Please provide the temporary password to the user via a secure channel.',
      // In production, remove the temporary password from the response
      tempPassword // ONLY FOR DEVELOPMENT - REMOVE IN PRODUCTION
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;