const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReplacementRecord = sequelize.define('ReplacementRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    damage_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'damage_reports',
            key: 'id',
        },
    },
    replacement_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Valid replacement date is required' },
        },
    },
    replacement_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: { msg: 'Replacement cost must be a valid number' },
            min: { args: [0], msg: 'Replacement cost cannot be negative' },
        },
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'replacement_records',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = ReplacementRecord;
