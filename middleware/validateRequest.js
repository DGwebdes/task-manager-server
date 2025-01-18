const { validationResult } = require('express-validator');

const validadeRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = validadeRequest;