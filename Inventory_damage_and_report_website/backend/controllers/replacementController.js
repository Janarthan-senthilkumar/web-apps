const { ReplacementRecord, DamageReport, Inventory } = require('../models');
const sequelize = require('../config/database');

// Get all replacement records with pagination
const getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await ReplacementRecord.findAndCountAll({
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: DamageReport,
                as: 'damageReport',
                include: [{ model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category'] }],
            }],
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

// Get single replacement record
const getById = async (req, res, next) => {
    try {
        const record = await ReplacementRecord.findByPk(req.params.id, {
            include: [{
                model: DamageReport,
                as: 'damageReport',
                include: [{ model: Inventory, as: 'inventory' }],
            }],
        });
        if (!record) {
            return res.status(404).json({ success: false, error: 'Replacement record not found' });
        }
        res.json({ success: true, data: record });
    } catch (error) {
        next(error);
    }
};

// Create replacement record (Approve & Replace - supervisor only)
// This uses a transaction to ensure data consistency
const create = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { damage_id, replacement_date, replacement_cost, notes } = req.body;

        // Verify damage report exists and is in Approved or Pending status
        const report = await DamageReport.findByPk(damage_id, {
            include: [{ model: Inventory, as: 'inventory' }],
            transaction: t,
        });

        if (!report) {
            await t.rollback();
            return res.status(404).json({ success: false, error: 'Damage report not found' });
        }

        if (report.status === 'Replaced') {
            await t.rollback();
            return res.status(400).json({ success: false, error: 'This damage report has already been replaced' });
        }

        if (report.status === 'Rejected') {
            await t.rollback();
            return res.status(400).json({ success: false, error: 'Cannot replace a rejected damage report' });
        }

        // 1. Create replacement record
        const record = await ReplacementRecord.create({
            damage_id,
            replacement_date,
            replacement_cost,
            notes,
        }, { transaction: t });

        // 2. Update damage report status to Replaced and set reviewer
        await report.update({
            status: 'Replaced',
            reviewed_by: req.user.id,
        }, { transaction: t });

        // 3. Decrement inventory quantity by 1
        const inventoryItem = await Inventory.findByPk(report.inventory_id, { transaction: t });
        if (inventoryItem) {
            const newQuantity = Math.max(0, inventoryItem.quantity - 1);
            await inventoryItem.update({ quantity: newQuantity }, { transaction: t });
        }

        // Commit the transaction
        await t.commit();

        // Fetch full record with associations
        const fullRecord = await ReplacementRecord.findByPk(record.id, {
            include: [{
                model: DamageReport,
                as: 'damageReport',
                include: [{ model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category', 'quantity'] }],
            }],
        });

        res.status(201).json({
            success: true,
            data: fullRecord,
            message: 'Replacement record created, inventory updated',
        });
    } catch (error) {
        await t.rollback();
        next(error);
    }
};

// Update replacement record
const update = async (req, res, next) => {
    try {
        const record = await ReplacementRecord.findByPk(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: 'Replacement record not found' });
        }

        const { damage_id, replacement_date, replacement_cost, notes } = req.body;

        if (damage_id) {
            const report = await DamageReport.findByPk(damage_id);
            if (!report) {
                return res.status(404).json({ success: false, error: 'Damage report not found' });
            }
        }

        await record.update({ damage_id, replacement_date, replacement_cost, notes });

        const fullRecord = await ReplacementRecord.findByPk(record.id, {
            include: [{
                model: DamageReport,
                as: 'damageReport',
                include: [{ model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category'] }],
            }],
        });

        res.json({ success: true, data: fullRecord, message: 'Replacement record updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete replacement record
const remove = async (req, res, next) => {
    try {
        const record = await ReplacementRecord.findByPk(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, error: 'Replacement record not found' });
        }
        await record.destroy();
        res.json({ success: true, message: 'Replacement record deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAll, getById, create, update, remove };
