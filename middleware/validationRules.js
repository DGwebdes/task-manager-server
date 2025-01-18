const { body } = require('express-validator');

const registerValidationRules = () => {
    return [
        body('username')
            .isLength({ min: 4 })
            .withMessage('Username must be at least 4 characters long.')
            .trim()
            .escape(),
        body('email')
            .isEmail()
            .withMessage('Invalid email format.')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long.')
            .matches(/\d/)
            .withMessage('Password must contain a number.')
            .matches(/[A-Z]/)
            .withMessage('Password must contain an uppercase letter.')
            .matches(/[a-z]/)
            .withMessage('Password must contain a lowercase letter.')
            .matches(/[@$!%*?&]/)
            .withMessage('Password must contain a special character.'),
    ];
};

module.exports = {
    registerValidationRules,
};