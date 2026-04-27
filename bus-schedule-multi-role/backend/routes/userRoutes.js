const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, getUserStats, resetPassword
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const HEAD = ['organisation_head'];
const HEAD_STAFF = ['organisation_head', 'staff'];

router.use(protect);

router.get('/stats', authorize(...HEAD), getUserStats);
router.get('/', authorize(...HEAD), getAllUsers);
router.post('/', authorize(...HEAD), createUser);
router.get('/:id', authorize(...HEAD), getUserById);
router.put('/:id', authorize(...HEAD), updateUser);
router.delete('/:id', authorize(...HEAD), deleteUser);
router.put('/:id/reset-password', authorize(...HEAD), resetPassword);

module.exports = router;
