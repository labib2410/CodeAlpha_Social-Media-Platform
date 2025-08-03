const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret', (err, decodedToken) => {
        if (err) return res.status(403).json({ success: false, message: "Invalid token" });

        req.user = decodedToken; // فيه userId و email
        next();
    });
};

module.exports = authenticateToken;
