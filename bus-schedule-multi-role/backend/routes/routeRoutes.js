const express = require('express');
const router = express.Router();
const {
  getRoutes, getRouteById, createRoute, updateRoute, deleteRoute, getLocations
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/locations', getLocations);
router.get('/', getRoutes);
router.get('/:id', getRouteById);
router.post('/', authorize('organisation_head'), createRoute);
router.put('/:id', authorize('organisation_head', 'staff'), updateRoute);
router.delete('/:id', authorize('organisation_head'), deleteRoute);

module.exports = router;
