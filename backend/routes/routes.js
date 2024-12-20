const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");
const auth = require("../middleware/auth"); // Import JWT authentication middleware

// -------------------- Public Routes -------------------- //
// Fetch all talks (no token required)
router.get("/talks", controller.listConf);

// Fetch a specific talk by ID (no token required)
router.get("/talks/:id", (req, res) => {
    const talkId = req.params.id;
    controller.getTalkById(talkId, res);
});

// Fetch talks by specific query (no token required)
router.get("/talks/speaker/:term", controller.listOneSpeaker);
router.get("/talks/session/:term", controller.listSession);
router.get("/talks/time/:term", controller.listTime);

// Fetch ratings for talks (no token required)
router.get("/talks/:speaker/rating", controller.listRatingsBySpeaker);
router.get("/talks/:id/ratingById", controller.listRatingsById);

// User registration and login
router.post("/register", controller.registerUser); // Use the actual registration logic
router.post("/login", controller.loginUser);

// -------------------- Protected Routes -------------------- //
// Rate a talk (requires authentication)
router.post("/talks/:id/rate", auth, controller.rateTalkById);

router.post("/talks/:id/comment", auth, controller.addCommentToTalk);

// -------------------- Error Handling -------------------- //
// Handle 404 errors
router.use((req, res) => {
    res.status(404).send("404 Not Found");
});

// Handle server errors
router.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).send("Internal Server Error");
});

module.exports = router;