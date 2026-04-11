const Inventory = require('./Inventory');
const DamageReport = require('./DamageReport');
const ReplacementRecord = require('./ReplacementRecord');
const User = require('./User');

// Inventory has many DamageReports
Inventory.hasMany(DamageReport, {
    foreignKey: 'inventory_id',
    as: 'damageReports',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

DamageReport.belongsTo(Inventory, {
    foreignKey: 'inventory_id',
    as: 'inventory',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// DamageReport has many ReplacementRecords
DamageReport.hasMany(ReplacementRecord, {
    foreignKey: 'damage_id',
    as: 'replacementRecords',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

ReplacementRecord.belongsTo(DamageReport, {
    foreignKey: 'damage_id',
    as: 'damageReport',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// User has many DamageReports (as reporter)
User.hasMany(DamageReport, {
    foreignKey: 'reported_by',
    as: 'reportedDamages',
});

DamageReport.belongsTo(User, {
    foreignKey: 'reported_by',
    as: 'reporter',
});

// User has many DamageReports (as reviewer)
User.hasMany(DamageReport, {
    foreignKey: 'reviewed_by',
    as: 'reviewedDamages',
});

DamageReport.belongsTo(User, {
    foreignKey: 'reviewed_by',
    as: 'reviewer',
});

module.exports = {
    Inventory,
    DamageReport,
    ReplacementRecord,
    User,
};
