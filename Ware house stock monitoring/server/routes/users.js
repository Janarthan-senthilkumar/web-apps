const express = require('express');
const router = express.Router();
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(authorize('admin', 'manager'), getUsers).post(authorize('admin'), createUser);
router.route('/:id').get(authorize('admin', 'manager'), getUser).put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);

module.exports = router;
