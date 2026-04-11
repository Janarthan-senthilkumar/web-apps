const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DamageReport = sequelize.define('DamageReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'inventory',
            key: 'id',
        },
    },
    reported_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    damage_description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Damage description is required' },
        },
    },
    damage_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Valid damage date is required' },
        },
    },
    damage_image_path: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Replaced'),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
            isIn: {
                args: [['Pending', 'Approved', 'Rejected', 'Replaced']],
                msg: 'Status must be Pending, Approved, Rejected, or Replaced',
            },
        },
    },
}, {
    tableName: 'damage_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = DamageReport;
