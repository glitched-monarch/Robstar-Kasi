const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const validations = {
  // Phone number validation (Kenyan format)
  phone: body('phone')
    .matches(/^07[0-9]{8}$/)
    .withMessage('Invalid Kenyan phone number format'),

  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

  // Current password and new password for change password
  currentPassword: body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  newPassword: body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),

  // UUID validation for IDs
  id: param('id')
    .isUUID()
    .withMessage('Invalid ID format'),

  // Quantity validation (positive integer)
  qty: body('qty')
    .isInt({ gt: 0 })
    .withMessage('Quantity must be a positive integer'),

  // Status validation
  status: body('status')
    .isIn(['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),

  // Product ID validation (UUID)
  productId: body('product_id')
    .isUUID()
    .withMessage('Invalid product ID'),

  // Order ID validation (UUID)
  orderId: body('order_id')
    .isUUID()
    .withMessage('Invalid order ID'),

  // Search query sanitization (allow alphanumeric and spaces)
  search: query('search')
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9\s\-]*$/)
    .withMessage('Search query contains invalid characters'),

  // Category validation (alphanumeric and spaces, hyphens, underscores)
  category: query('category')
    .optional()
    .isString()
    .matches(/^[a-zA-Z0-9\s\-_]*$/)
    .withMessage('Invalid category'),
};

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  ...validations,
  handleValidationErrors
};