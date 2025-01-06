// Load environment variables
require("dotenv").config();
// Conference model imported to interact with the database
const confDAO = require("../models/confModel");
const conf = new confDAO({ filename: process.env.CONF_FILE_PATH, autoload: true });
// Necessary libraries imported
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// Middleware to authenticate user
const auth = require("../middleware/auth"); 
// Datastore to store user data
const Datastore = require("gray-nedb");
const userDB = new Datastore({ filename: process.env.DATABASE_FILE_PATH, autoload: true });

// Regular expression to validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -------- Register User --------
// Function to register a new user
exports.registerUser = (req, res) => {
  const { username, email, password } = req.body;

  // Check if username, email, and password are provided
  if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
  }

  if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
          message: "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.",
      });
  }

  // Check if the username or email already exists
  userDB.findOne({ $or: [{ username }, { email }] }, (err, existingUser) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal server error" });
      }
      if (existingUser) {
          return res.status(400).json({ message: "Username or email already exists" });
      }

     // Hash the password 
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create a new user object
      const newUser = {
          username,
          email,
          password: hashedPassword,
          createdAt: new Date(),
      };
      // Insert the new user into the database
      userDB.insert(newUser, (err, createdUser) => {
          if (err) {
              console.error("Error saving user:", err);
              return res.status(500).json({ message: "Failed to register user" });
          }

          res.status(201).json({
              message: "User registered successfully",
              user: {
                  username: createdUser.username,
                  email: createdUser.email,
                  createdAt: createdUser.createdAt,
              },
          });
      });
  });
};

// -------- Login User --------
// Function to login a user
exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    userDB.findOne({ username }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        // Check if the password is valid
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

    // Generate a JWT token
    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET, 
        {
          expiresIn: "1h",
        }
      );

        res.status(200).json({ token, username: user.username });
    });
};
// -------- Get All Users --------
exports.newList = function (req, res) {
  conf.init();
  res.redirect("/");
};
exports.listConf = function (req, res) {
  conf
    .getAllEntries()
    .then((list) => {
      res.json(list);
      console.log(list);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Speaker --------
exports.listOneSpeaker = function (req, res) {
  let speakerName = req.params["term"];
  conf
    .getSpeaker(speakerName)
    .then((list) => {
      res.json(list);
      console.log(list);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Session --------
exports.listSession = function (req, res) {
  let sessionName = req.params["term"];
  conf
    .getSession(sessionName)
    .then((list) => {
      res.json(list);
      console.log(list);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Time --------
exports.listTime = function (req, res) {
  let talkTime = req.params["term"];
  conf
    .getTime(talkTime)
    .then((list) => {
      res.json(list);
      console.log(list);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Ratings By Speaker --------
exports.listRatingsBySpeaker = function (req, res) {
  let speakerName = req.params["speaker"];
  conf
    .getSpeaker(speakerName)
    .then((list) => {
      res.json(list[0].ratings);
      console.log("ratings: ", list[0].ratings);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Ratings By ID --------
exports.listRatingsById = function (req, res) {
  let talkId = req.params["id"];
  conf
    .getTalkById(talkId)
    .then((list) => {
      res.json(list[0].ratings);
      console.log("ratings: ", list[0].ratings);
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
// -------- Get Talk By ID --------
exports.getTalkById = function (id, res) {
  conf.getTalkById(id)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }
          res.json(talk[0]); 
      })
      .catch((err) => {
          console.error("Error fetching talk:", err);
          res.status(500).json({ message: "Internal server error" });
      });
};
// -------- Rate Talk By ID --------
exports.rateTalkById = [
  auth, 
  (req, res) => {
      const talkId = req.params.id; 
      const { rating } = req.body; 
      const userId = req.user.id; 

      // Check if the rating is provided
      if (!userId || isNaN(rating)) {
          console.log("Invalid userId or rating received");
          return res.status(400).json({ message: "Invalid userId or rating" });
      }

      // Fetch the talk by ID
      conf.getTalkById(talkId)
          .then((talk) => {
              if (!talk || talk.length === 0) {
                  console.log(`Talk with ID ${talkId} not found.`);
                  return res.status(404).json({ message: "Talk not found" });
              }

              // Check if the user has already rated the talk
              return conf.rateTalkById(talkId, userId, rating)
                  .then(() => conf.getTalkById(talkId)) 
                  .then((updatedTalk) => {
                      res.status(200).json(updatedTalk[0]); 
                  });
          })
          .catch((err) => {
              console.error("Error processing rating:", err);
              res.status(500).json({ message: "Internal server error" });
          });
  },
];

const { v4: uuidv4 } = require("uuid");

// -------- Add Comment --------
// Function to add a comment to a talk
exports.addCommentToTalk = (req, res) => {
    const { id: talkId } = req.params;
    const { comment } = req.body;
    const { username } = req.user;

    if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }
// Fetch the talk by ID
    conf.getTalkById(talkId)
        .then((talk) => {
            if (!talk || talk.length === 0) {
                return res.status(404).json({ message: "Talk not found" });
            }
            // Create a new comment object
            const userComment = {
                id: uuidv4(),
                username,
                comment,
                timestamp: new Date(),
            };
            // Update the comments array with the new comment
            const updatedComments = [...(talk[0].comments || []), userComment];

            conf.conf.update(
                { id: talkId },
                { $set: { comments: updatedComments } },
                {},
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Failed to add comment" });
                    }
                    res.status(200).json({ ...talk[0], comments: updatedComments });
                }
            );
        })
        .catch((err) => {
            console.error("Error fetching talk:", err);
            res.status(500).json({ message: "Internal server error" });
        });
};

// -------- Edit Comment --------
// Function to edit a comment
exports.editComment = (req, res) => {
    const { id: talkId, commentId } = req.params;
    const { comment } = req.body;
    const { username } = req.user;
// Check if the comment is provided
    if (!comment || comment.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }
    // Fetch the talk by ID
    conf.getTalkById(talkId)
        .then((talk) => {
            if (!talk || talk.length === 0) {
                return res.status(404).json({ message: "Talk not found" });
            }

            const existingComment = talk[0].comments.find((c) => c.id === commentId);

            if (!existingComment || existingComment.username !== username) {
                return res.status(403).json({ message: "Unauthorized to edit this comment" });
            }
            // Update the comment
            existingComment.comment = comment;

            conf.conf.update(
                { id: talkId },
                { $set: { comments: talk[0].comments } },
                {},
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Failed to edit comment" });
                    }
                    res.status(200).json({ ...talk[0] });
                }
            );
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
};

// -------- Delete Comment --------
// Function to delete a comment
exports.deleteComment = (req, res) => {
    const { id: talkId, commentId } = req.params;
    const { username } = req.user;
    // Fetch the talk by ID
    conf.getTalkById(talkId)
        .then((talk) => {
            if (!talk || talk.length === 0) {
                return res.status(404).json({ message: "Talk not found" });
            }
            // Find the comment to delete
            const commentIndex = talk[0].comments.findIndex(
                (c) => c.id === commentId && c.username === username
            );

            if (commentIndex === -1) {
                return res.status(403).json({ message: "Unauthorized to delete this comment" });
            }

            talk[0].comments.splice(commentIndex, 1);
            // Update the comments array
            conf.conf.update(
                { id: talkId },
                { $set: { comments: talk[0].comments } },
                {},
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: "Failed to delete comment" });
                    }
                    res.status(200).json({ ...talk[0] });
                }
            );
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "Internal server error" });
        });
};
// -------- Get Comments --------
exports.handlePosts = function (req, res) {
  let talkId = req.body.talkId;
  let newRating = req.body.rating;
  conf
    .rateTalk(talkId, newRating)
    .then(console.log("rating added"))
    .catch((err) => {
      console.log("promise rejected", err);
    });
};
