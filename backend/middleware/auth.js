const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Extract the token
        const decoded = jwt.verify(token.split(" ")[1], "your_jwt_secret"); // Replace "your_jwt_secret" with your actual secret key
        req.user = decoded; // Attach decoded user info to req.user
        next(); // Pass control to the next middleware/route handler
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};