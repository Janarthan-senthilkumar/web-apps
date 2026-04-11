const { Inventory, DamageReport, ReplacementRecord, User } = require('../models');
const sequelize = require('../config/database');

// Get dashboard statistics
const getStats = async (req, res, next) => {
    try {
        const totalInventory = await Inventory.count();
        const totalDamaged = await DamageReport.count();
        const totalReplacements = await ReplacementRecord.count();

        const pendingCount = await DamageReport.count({ where: { status: 'Pending' } });
        const approvedCount = await DamageReport.count({ where: { status: 'Approved' } });
        const rejectedCount = await DamageReport.count({ where: { status: 'Rejected' } });
        const replacedCount = await DamageReport.count({ where: { status: 'Replaced' } });

        const totalReplacementCost = await ReplacementRecord.sum('replacement_cost') || 0;

        // Recent damage reports
        const recentDamageReports = await DamageReport.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [
                { model: Inventory, as: 'inventory', attributes: ['id', 'name', 'category', 'image_path'] },
                { model: User, as: 'reporter', attributes: ['id', 'name'] },
            ],
        });

        // Recent replacements
        const recentReplacements = await ReplacementRecord.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: DamageReport,
                as: 'damageReport',
                include: [{ model: Inventory, as: 'inventory', attributes: ['id', 'name'] }],
            }],
        });

        res.json({
            success: true,
            data: {
                totalInventory,
                totalDamaged,
                totalReplacements,
                totalReplacementCost,
                statusDistribution: {
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount,
                    replaced: replacedCount,
                },
                recentDamageReports,
                recentReplacements,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };
