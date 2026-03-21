const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const restrictTo = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role ? req.user.role.toUpperCase() : '';
        const allowedRoles = roles.map(r => r.toUpperCase());
        
        if (!allowedRoles.includes(userRole)) {
            console.warn(`[AUTH] Access Denied for ${req.user.email}. User Role: ${userRole}, Allowed: ${allowedRoles}`);
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};

module.exports = { authenticateJWT, restrictTo };
