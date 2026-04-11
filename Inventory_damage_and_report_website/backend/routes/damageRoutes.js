const express = require('express');
const router = express.Router();
const damageController = require('../controllers/damageController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { damageReportRules, handleValidation } = require('../middleware/validate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===============================
// Configure Multer for damage reports
// ===============================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/damage');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                '-' +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb(new Error('Only images (.jpg, .jpeg, .png) are allowed'));
    },
});

// ===============================
// Middleware
// ===============================

// All routes require authentication
router.use(authMiddleware);

// ===============================
// Routes
// ===============================

// GET all damage reports
router.get('/', damageController.getAll);

// GET single damage report
router.get('/:id', damageController.getById);

// POST create damage report (staff only + image upload)
router.post(
    '/',
    requireRole('staff'),
    upload.single('damage_image'), // IMPORTANT
    damageReportRules,
    handleValidation,
    damageController.create
);

// PUT update damage report
router.put(
    '/:id',
    upload.single('damage_image'),
    damageReportRules,
    handleValidation,
    damageController.update
);

// PATCH approve damage report (supervisor only)
router.patch(
    '/:id/approve',
    requireRole('supervisor'),
    damageController.approve
);

// PATCH reject damage report (supervisor only)
router.patch(
    '/:id/reject',
    requireRole('supervisor'),
    damageController.reject
);

// DELETE damage report
router.delete('/:id', damageController.remove);

module.exports = router;
