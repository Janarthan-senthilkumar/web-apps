const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Name is required' },
            len: { args: [1, 255], msg: 'Name must be between 1 and 255 characters' },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Email already exists' },
        validate: {
            notEmpty: { msg: 'Email is required' },
            isEmail: { msg: 'Must be a valid email address' },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Password is required' },
            len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
        },
    },
    role: {
        type: DataTypes.ENUM('staff', 'supervisor'),
        allowNull: false,
        defaultValue: 'staff',
        validate: {
            isIn: {
                args: [['staff', 'supervisor']],
                msg: 'Role must be staff or supervisor',
            },
        },
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to return user without password
User.prototype.toSafeJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    return values;
};

module.exports = User;
