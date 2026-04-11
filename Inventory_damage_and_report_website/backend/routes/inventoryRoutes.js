const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { inventoryRules, handleValidation } = require('../middleware/validate');

// All routes require authentication
router.use(authMiddleware);

// GET all inventory items
router.get('/', inventoryController.getAll);

// GET categories
router.get('/categories', inventoryController.getCategories);

// GET single inventory item
router.get('/:id', inventoryController.getById);

// POST create inventory item (with image upload)
router.post('/', upload.single('image'), inventoryRules, handleValidation, inventoryController.create);

// PUT update inventory item (with optional image upload)
router.put('/:id', upload.single('image'), inventoryRules, handleValidation, inventoryController.update);

// DELETE inventory item
router.delete('/:id', inventoryController.remove);

module.exports = router;
