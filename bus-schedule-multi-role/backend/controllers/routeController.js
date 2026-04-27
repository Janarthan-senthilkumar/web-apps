const Route = require('../models/Route');

// @desc  Get all routes
// @route GET /api/routes
const getRoutes = async (req, res, next) => {
  try {
    const { source, destination, search, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = { $regex: source, $options: 'i' };
    if (destination) filter.destination = { $regex: destination, $options: 'i' };
    if (search) {
      filter.$or = [
        { routeNumber: { $regex: search, $options: 'i' } },
        { routeName: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }
    const routes = await Route.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: routes.length, data: routes });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all unique sources & destinations for search dropdowns
// @route GET /api/routes/locations
const getLocations = async (req, res, next) => {
  try {
    const sources = await Route.distinct('source', { status: 'Active' });
    const destinations = await Route.distinct('destination', { status: 'Active' });
    const allLocations = [...new Set([...sources, ...destinations])].sort();
    res.json({ success: true, data: { sources, destinations, allLocations } });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single route
// @route GET /api/routes/:id
const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc  Create route
// @route POST /api/routes
const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc  Update route
// @route PUT /api/routes/:id
const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete route
// @route DELETE /api/routes/:id
const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      res.status(404);
      throw new Error('Route not found');
    }
    res.json({ success: true, message: 'Route deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoutes, getLocations, getRouteById, createRoute, updateRoute, deleteRoute };
