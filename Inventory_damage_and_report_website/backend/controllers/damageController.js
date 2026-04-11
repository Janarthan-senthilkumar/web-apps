const { DamageReport, Inventory, ReplacementRecord, User } = require('../models');
const { Op } = require('sequelize');

// Get all damage reports
const getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';

        const where = {};

        if (req.user && req.user.role === 'staff') {
            where.reported_by = req.user.id;
        }

        if (status) where.status = status;
        if (search) where.damage_description = { [Op.like]: `%${search}%` };

        const { count, rows } = await DamageReport.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                { model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category', 'image_path'] },
                { model: ReplacementRecord, as: 'replacementRecords', attributes: ['id'] },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] },
            ],
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single damage report
const getById = async (req, res, next) => {
    try {
        const report = await DamageReport.findByPk(req.params.id, {
            include: [
                { model: Inventory, as: 'inventory' },
                { model: ReplacementRecord, as: 'replacementRecords' },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] },
            ],
        });

        if (!report) {
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        res.json({ success: true, data: report });
    } catch (error) {
        next(error);
    }
};

// Create damage report
const create = async (req, res, next) => {
    try {
        const { inventory_id, damage_description, damage_date } = req.body;

        const item = await Inventory.findByPk(inventory_id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }

        let damage_image_path = null;
        if (req.file) {
            damage_image_path = '/' + req.file.path.replace(/\\/g, '/');
        }

        const report = await DamageReport.create({
            inventory_id,
            damage_description,
            damage_date,
            status: 'Pending',
            reported_by: req.user.id,
            damage_image_path,
        });

        const fullReport = await DamageReport.findByPk(report.id, {
            include: [
                { model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category'] },
                { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
            ],
        });

        res.status(201).json({
            success: true,
            data: fullReport,
            message: 'Damage report created successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Update damage report
const update = async (req, res, next) => {
    try {
        const report = await DamageReport.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        const { inventory_id, damage_description, damage_date, status } = req.body;

        if (inventory_id) {
            const item = await Inventory.findByPk(inventory_id);
            if (!item) {
                return res.status(404).json({ success: false, error: 'Inventory item not found' });
            }
        }

        await report.update({ inventory_id, damage_description, damage_date, status });

        res.json({ success: true, message: 'Damage report updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Approve
const approve = async (req, res, next) => {
    try {
        const report = await DamageReport.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        if (report.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Only pending reports can be approved' });
        }

        const { review_notes } = req.body;

        await report.update({
            status: 'Approved',
            reviewed_by: req.user.id,
            review_notes: review_notes || null,
        });

        res.json({ success: true, message: 'Damage report approved' });
    } catch (error) {
        next(error);
    }
};

// Reject
const reject = async (req, res, next) => {
    try {
        const report = await DamageReport.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        if (report.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'Only pending reports can be rejected' });
        }

        const { review_notes } = req.body;

        await report.update({
            status: 'Rejected',
            reviewed_by: req.user.id,
            review_notes: review_notes || null,
        });

        res.json({ success: true, message: 'Damage report rejected' });
    } catch (error) {
        next(error);
    }
};

// Delete
const remove = async (req, res, next) => {
    try {
        const report = await DamageReport.findByPk(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        await report.destroy();
        res.json({ success: true, message: 'Damage report deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAll, getById, create, update, approve, reject, remove };
