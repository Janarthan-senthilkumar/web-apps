const Bus = require('../models/Bus');

// @desc  Get all buses
// @route GET /api/buses
const getBuses = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { busNumber: { $regex: search, $options: 'i' } },
        { busName: { $regex: search, $options: 'i' } },
        { operator: { $regex: search, $options: 'i' } },
      ];
    }
    const buses = await Bus.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: buses.length, data: buses });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single bus
// @route GET /api/buses/:id
const getBusById = async (req, res, next) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
};

// @desc  Create bus
// @route POST /api/buses
const createBus = async (req, res, next) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
};

// @desc  Update bus
// @route PUT /api/buses/:id
const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }
    res.json({ success: true, data: bus });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete bus
// @route DELETE /api/buses/:id
const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) {
      res.status(404);
      throw new Error('Bus not found');
    }
    res.json({ success: true, message: 'Bus deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get bus stats
// @route GET /api/buses/stats
const getBusStats = async (req, res, next) => {
  try {
    const total = await Bus.countDocuments();
    const active = await Bus.countDocuments({ status: 'Active' });
    const maintenance = await Bus.countDocuments({ status: 'Maintenance' });
    const inactive = await Bus.countDocuments({ status: 'Inactive' });
    const byType = await Bus.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { total, active, maintenance, inactive, byType } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBuses, getBusById, createBus, updateBus, deleteBus, getBusStats };
