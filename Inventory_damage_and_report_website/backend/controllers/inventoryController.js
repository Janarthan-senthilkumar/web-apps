const { Inventory, DamageReport } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Get all inventory items with pagination, search, and filter
const getAll = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';

        const where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
            ];
        }
        if (category) {
            where.category = category;
        }

        const { count, rows } = await Inventory.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{ model: DamageReport, as: 'damageReports', attributes: ['id', 'status'] }],
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

// Get single inventory item
const getById = async (req, res, next) => {
    try {
        const item = await Inventory.findByPk(req.params.id, {
            include: [{ model: DamageReport, as: 'damageReports' }],
        });
        if (!item) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

// Create inventory item
const create = async (req, res, next) => {
    try {
        const { name, category, quantity, location } = req.body;
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;

        const item = await Inventory.create({
            name, category, quantity: parseInt(quantity), location, image_path,
        });

        res.status(201).json({ success: true, data: item, message: 'Inventory item created successfully' });
    } catch (error) {
        next(error);
    }
};

// Update inventory item
const update = async (req, res, next) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }

        const { name, category, quantity, location } = req.body;
        const updateData = { name, category, quantity: parseInt(quantity), location };

        if (req.file) {
            // Delete old image if exists
            if (item.image_path) {
                const oldPath = path.join(__dirname, '..', item.image_path);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.image_path = `/uploads/${req.file.filename}`;
        }

        await item.update(updateData);
        res.json({ success: true, data: item, message: 'Inventory item updated successfully' });
    } catch (error) {
        next(error);
    }
};

// Delete inventory item
const remove = async (req, res, next) => {
    try {
        const item = await Inventory.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, error: 'Inventory item not found' });
        }

        // Delete associated image
        if (item.image_path) {
            const imagePath = path.join(__dirname, '..', item.image_path);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await item.destroy();
        res.json({ success: true, message: 'Inventory item deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get all categories
const getCategories = async (req, res, next) => {
    try {
        const items = await Inventory.findAll({
            attributes: ['category'],
            group: ['category'],
            order: [['category', 'ASC']],
        });
        const categories = items.map((i) => i.category);
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAll, getById, create, update, remove, getCategories };
