const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization; // Extract token from headers
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1]; // Extract the token part
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify token using SECRET_KEY
        req.user = decoded; // Attach decoded user data to the request
        next(); // Allow the request to proceed
    } catch (err) {
        const isTokenExpired = err.name === 'TokenExpiredError';
        const message = isTokenExpired ? 'Token Expired.' : 'Invalid Token';
        res.status(401).json({ message });
    }
};
module.exports = authMiddleware;