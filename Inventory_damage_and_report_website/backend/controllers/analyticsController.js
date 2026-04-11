const { DamageReport, Inventory, ReplacementRecord, User } = require('../models');
const sequelize = require('../config/database');
const { fn, col, literal } = require('sequelize');

// Get comprehensive analytics data
const getAnalytics = async (req, res, next) => {
    try {
        // Basic counts
        const totalReports = await DamageReport.count();
        const totalApproved = await DamageReport.count({ where: { status: 'Approved' } });
        const totalRejected = await DamageReport.count({ where: { status: 'Rejected' } });
        const totalReplaced = await DamageReport.count({ where: { status: 'Replaced' } });
        const totalPending = await DamageReport.count({ where: { status: 'Pending' } });
        const totalReplacements = await ReplacementRecord.count();
        const totalReplacementCost = await ReplacementRecord.sum('replacement_cost') || 0;

        // Most damaged inventory item
        const mostDamagedResult = await DamageReport.findAll({
            attributes: [
                'inventory_id',
                [fn('COUNT', col('DamageReport.id')), 'damage_count'],
            ],
            include: [{
                model: Inventory,
                as: 'inventory',
                attributes: ['name', 'category'],
            }],
            group: ['inventory_id'],
            order: [[literal('damage_count'), 'DESC']],
            limit: 1,
            raw: false,
        });

        const mostDamagedItem = mostDamagedResult.length > 0 ? {
            name: mostDamagedResult[0].inventory?.name || 'Unknown',
            category: mostDamagedResult[0].inventory?.category || 'Unknown',
            count: mostDamagedResult[0].get('damage_count'),
        } : null;

        // Damage frequency by category
        const damageByCategory = await DamageReport.findAll({
            attributes: [
                [literal('inventory.category'), 'category'],
                [fn('COUNT', col('DamageReport.id')), 'count'],
            ],
            include: [{
                model: Inventory,
                as: 'inventory',
                attributes: [],
            }],
            group: [literal('inventory.category')],
            order: [[literal('count'), 'DESC']],
            raw: true,
        });

        // Monthly damage trend (last 12 months)
        const monthlyTrend = await DamageReport.findAll({
            attributes: [
                [fn('strftime', '%Y-%m', col('damage_date')), 'month'],
                [fn('COUNT', col('DamageReport.id')), 'count'],
            ],
            group: [literal("strftime('%Y-%m', damage_date)")],
            order: [[literal('month'), 'ASC']],
            raw: true,
            limit: 12,
        });

        // Cost analysis per month
        const monthlyCost = await ReplacementRecord.findAll({
            attributes: [
                [fn('strftime', '%Y-%m', col('replacement_date')), 'month'],
                [fn('SUM', col('replacement_cost')), 'total_cost'],
                [fn('COUNT', col('ReplacementRecord.id')), 'count'],
            ],
            group: [literal("strftime('%Y-%m', replacement_date)")],
            order: [[literal('month'), 'ASC']],
            raw: true,
            limit: 12,
        });

        // Status distribution
        const statusDistribution = {
            pending: totalPending,
            approved: totalApproved,
            rejected: totalRejected,
            replaced: totalReplaced,
        };

        res.json({
            success: true,
            data: {
                totalReports,
                totalApproved,
                totalRejected,
                totalReplaced,
                totalPending,
                totalReplacements,
                totalReplacementCost,
                mostDamagedItem,
                damageByCategory,
                monthlyTrend,
                monthlyCost,
                statusDistribution,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAnalytics };
