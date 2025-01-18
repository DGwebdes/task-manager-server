const errorResponse = (res, statusCode, message, details = null) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            message,
            details,
        },
    });
};

module.exports = errorResponse;