const jwt = require("jsonwebtoken");
// Middleware to authenticate the token
module.exports = (req, res, next) => {
    const token = req.headers.authorization;
    // Check if token exists
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token.split(" ")[1], "jwt_secret"); 
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};