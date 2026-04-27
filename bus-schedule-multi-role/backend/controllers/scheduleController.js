const Schedule = require('../models/Schedule');
const Route = require('../models/Route');

// @desc  Get all schedules
// @route GET /api/schedules
const getSchedules = async (req, res, next) => {
  try {
    const { status, day, busId, routeId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (busId) filter.bus = busId;
    if (routeId) filter.route = routeId;
    if (day) filter.daysOfOperation = { $in: [day] };

    const schedules = await Schedule.find(filter)
      .populate('bus', 'busNumber busName type capacity status')
      .populate('route', 'routeNumber routeName source destination totalDistance estimatedDuration')
      .sort({ departureTime: 1 });

    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    next(err);
  }
};

// @desc  Search schedules by source, destination, time, day
// @route GET /api/schedules/search
const searchSchedules = async (req, res, next) => {
  try {
    const { from, to, time, day, maxFare } = req.query;

    if (!from || !to) {
      res.status(400);
      throw new Error('Please provide source (from) and destination (to)');
    }

    // Find routes matching from -> to (direct or via stops)
    const routes = await Route.find({
      status: 'Active',
      $or: [
        {
          source: { $regex: from, $options: 'i' },
          destination: { $regex: to, $options: 'i' },
        },
        {
          'stops.name': { $regex: from, $options: 'i' },
          destination: { $regex: to, $options: 'i' },
        },
        {
          source: { $regex: from, $options: 'i' },
          'stops.name': { $regex: to, $options: 'i' },
        },
        {
          'stops.name': { $regex: from, $options: 'i' },
          'stops.name': { $regex: to, $options: 'i' },
        },
      ],
    });

    const routeIds = routes.map((r) => r._id);

    const filter = {
      route: { $in: routeIds },
      status: { $ne: 'Cancelled' },
    };

    if (day) filter.daysOfOperation = { $in: [day] };
    if (maxFare) filter.fare = { $lte: Number(maxFare) };

    let schedules = await Schedule.find(filter)
      .populate('bus', 'busNumber busName type capacity amenities status')
      .populate('route', 'routeNumber routeName source destination stops totalDistance estimatedDuration routeType')
      .sort({ departureTime: 1 });

    // Filter by time (show buses departing after given time)
    if (time) {
      const [qHour, qMin] = time.split(':').map(Number);
      const queryMinutes = qHour * 60 + qMin;
      schedules = schedules.filter((s) => {
        const [sHour, sMin] = s.departureTime.split(':').map(Number);
        const schedMinutes = sHour * 60 + sMin;
        return schedMinutes >= queryMinutes;
      });
    }

    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single schedule
// @route GET /api/schedules/:id
const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('bus')
      .populate('route');
    if (!schedule) {
      res.status(404);
      throw new Error('Schedule not found');
    }
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

// @desc  Create schedule
// @route POST /api/schedules
const createSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.create(req.body);
    const populated = await Schedule.findById(schedule._id)
      .populate('bus', 'busNumber busName type capacity')
      .populate('route', 'routeNumber routeName source destination');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Update schedule
// @route PUT /api/schedules/:id
const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('bus', 'busNumber busName type capacity')
      .populate('route', 'routeNumber routeName source destination');
    if (!schedule) {
      res.status(404);
      throw new Error('Schedule not found');
    }
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete schedule
// @route DELETE /api/schedules/:id
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      res.status(404);
      throw new Error('Schedule not found');
    }
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get dashboard stats
// @route GET /api/schedules/stats
const getScheduleStats = async (req, res, next) => {
  try {
    const total = await Schedule.countDocuments();
    const onTime = await Schedule.countDocuments({ status: 'On Time' });
    const delayed = await Schedule.countDocuments({ status: 'Delayed' });
    const cancelled = await Schedule.countDocuments({ status: 'Cancelled' });

    // Today's schedules
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = days[new Date().getDay()];
    const todayCount = await Schedule.countDocuments({ daysOfOperation: { $in: [today] } });

    res.json({ success: true, data: { total, onTime, delayed, cancelled, todayCount } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSchedules,
  searchSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleStats,
};
