const { body, validationResult } = require('express-validator');

// Handle validation results
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            messages: errors.array().map((e) => e.msg),
        });
    }
    next();
};

// Inventory validation rules
const inventoryRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Item name is required')
        .isLength({ max: 255 }).withMessage('Name must be less than 255 characters')
        .escape(),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .escape(),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
        .toInt(),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .escape(),
];

// Damage report validation rules
const damageReportRules = [
    body('inventory_id')
        .notEmpty().withMessage('Inventory item is required')
        .isInt().withMessage('Inventory ID must be an integer')
        .toInt(),
    body('damage_description')
        .trim()
        .notEmpty().withMessage('Damage description is required'),
    body('damage_date')
        .notEmpty().withMessage('Damage date is required')
        .isISO8601().withMessage('Valid date is required'),
    body('status')
        .optional()
        .isIn(['Pending', 'Approved', 'Rejected', 'Replaced']).withMessage('Status must be Pending, Approved, Rejected, or Replaced'),
];

// Replacement record validation rules
const replacementRecordRules = [
    body('damage_id')
        .notEmpty().withMessage('Damage report is required')
        .isInt().withMessage('Damage ID must be an integer')
        .toInt(),
    body('replacement_date')
        .notEmpty().withMessage('Replacement date is required')
        .isISO8601().withMessage('Valid date is required'),
    body('replacement_cost')
        .notEmpty().withMessage('Replacement cost is required')
        .isFloat({ min: 0 }).withMessage('Cost must be a non-negative number')
        .toFloat(),
    body('notes')
        .optional()
        .trim(),
];

// Register validation rules
const registerRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['staff', 'supervisor']).withMessage('Role must be staff or supervisor'),
];

// Login validation rules
const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

module.exports = {
    handleValidation,
    inventoryRules,
    damageReportRules,
    replacementRecordRules,
    registerRules,
    loginRules,
};
