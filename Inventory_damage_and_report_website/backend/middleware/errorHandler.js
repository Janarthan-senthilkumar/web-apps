const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map((e) => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            messages,
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            success: false,
            error: 'Duplicate entry',
            messages: ['A record with this value already exists'],
        });
    }

    // Sequelize foreign key constraint error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            success: false,
            error: 'Foreign Key Error',
            messages: ['Referenced record does not exist or cannot be deleted due to existing references'],
        });
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File too large',
            messages: ['File size must be less than 5MB'],
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'Unexpected file',
            messages: ['Only single image upload is allowed'],
        });
    }

    // Express-validator errors
    if (err.array && typeof err.array === 'function') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            messages: err.array().map((e) => e.msg),
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        messages: [err.message || 'Something went wrong'],
    });
};

module.exports = errorHandler;
