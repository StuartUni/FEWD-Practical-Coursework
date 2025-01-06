const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllers");
const auth = require("../middleware/auth"); 

// -------------------- Public Routes -------------------- //

router.get("/talks", controller.listConf);


router.get("/talks/:id", (req, res) => {
    const talkId = req.params.id;
    controller.getTalkById(talkId, res);
});


router.get("/talks/speaker/:term", controller.listOneSpeaker);
router.get("/talks/session/:term", controller.listSession);
router.get("/talks/time/:term", controller.listTime);


router.get("/talks/:speaker/rating", controller.listRatingsBySpeaker);
router.get("/talks/:id/ratingById", controller.listRatingsById);


router.post("/register", controller.registerUser); 
router.post("/login", controller.loginUser);

// -------------------- Protected Routes -------------------- //


router.post("/talks/:id/rate", auth, controller.rateTalkById);

router.post("/talks/:id/comment", auth, controller.addCommentToTalk);


router.put("/talks/:id/comments/:commentId", auth, controller.editComment);


router.delete("/talks/:id/comments/:commentId", auth, controller.deleteComment);

// -------------------- Error Handling -------------------- //


router.use((req, res) => {
    res.status(404).send("404 Not Found");
});


router.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).send("Internal Server Error");
});

module.exports = router;