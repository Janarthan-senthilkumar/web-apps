const Zone = require('../models/Zone');
const { getPagination, createAuditLog } = require('../utils/helpers');

const getZones = async (req, res) => {
  try {
    const { page, limit, skip, sort } = getPagination(req.query);
    const filter = {};
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const total = await Zone.countDocuments(filter);
    const zones = await Zone.find(filter)
      .populate('warehouse', 'name code')
      .populate('parentZone', 'name code')
      .sort(sort).skip(skip).limit(limit);

    res.json({ success: true, data: zones, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id)
      .populate('warehouse', 'name code')
      .populate('parentZone', 'name code');
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    await createAuditLog({
      action: 'create', entity: 'zone', entityId: zone._id,
      user: req.user._id, description: `Created zone: ${zone.name}`, req,
    });
    res.status(201).json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    await createAuditLog({
      action: 'update', entity: 'zone', entityId: zone._id,
      user: req.user._id, description: `Updated zone: ${zone.name}`, req,
    });
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    await createAuditLog({
      action: 'delete', entity: 'zone', entityId: zone._id,
      user: req.user._id, description: `Deactivated zone: ${zone.name}`, req,
    });
    res.json({ success: true, message: 'Zone deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getZones, getZone, createZone, updateZone, deleteZone };
