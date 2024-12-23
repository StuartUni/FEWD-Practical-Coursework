const confDAO = require("../models/confModel");
const conf = new confDAO({ filename: "conf.db", autoload: true });

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const users = require("../models/users");

const auth = require("../middleware/auth"); // Import the auth middleware

const Datastore = require("gray-nedb");

// Initialize a new NeDB database for users
const userDB = new Datastore({ filename: "users.db", autoload: true });

// Middleware for password validation
// Email Validation Regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// -------- Register User --------
exports.registerUser = (req, res) => {
  const { username, email, password } = req.body;

  // Validate inputs
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

  // Check if user or email already exists
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

      // Create and save the user
      const newUser = {
          username,
          email,
          password: hashedPassword,
          createdAt: new Date(),
      };

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
exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    userDB.findOne({ username }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        // Compare hashed passwords
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid username or password." });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, username: user.username }, "your_jwt_secret", {
            expiresIn: "1h",
        });

        res.status(200).json({ token, username: user.username });
    });
};

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

exports.getTalkById = function (id, res) {
  conf.getTalkById(id)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }
          res.json(talk[0]); // Return the first matched talk
      })
      .catch((err) => {
          console.error("Error fetching talk:", err);
          res.status(500).json({ message: "Internal server error" });
      });
};

exports.rateTalkById = [
  auth, // Use the auth middleware to protect the route
  (req, res) => {
      const talkId = req.params.id; // Extract the talk ID from URL
      const { rating } = req.body; // Extract rating from the request body
      const userId = req.user.id; // Extract userId from the authenticated token

      // Validate inputs
      if (!userId || isNaN(rating)) {
          console.log("Invalid userId or rating received");
          return res.status(400).json({ message: "Invalid userId or rating" });
      }

      // Validate that the talk exists
      conf.getTalkById(talkId)
          .then((talk) => {
              if (!talk || talk.length === 0) {
                  console.log(`Talk with ID ${talkId} not found.`);
                  return res.status(404).json({ message: "Talk not found" });
              }

              // Add or update the user's rating
              return conf.rateTalkById(talkId, userId, rating)
                  .then(() => conf.getTalkById(talkId)) // Fetch updated talk
                  .then((updatedTalk) => {
                      res.status(200).json(updatedTalk[0]); // Return the updated talk
                  });
          })
          .catch((err) => {
              console.error("Error processing rating:", err);
              res.status(500).json({ message: "Internal server error" });
          });
  },
];

exports.addCommentToTalk = (req, res) => {
  const { id: talkId } = req.params; // Extract talk ID from request params
  const { comment } = req.body; // Extract comment from request body
  const { username } = req.user; // Extract username from decoded token in auth middleware

  // Load the conference model
  const confDAO = require("../models/confModel");
  const conf = new confDAO({ filename: "conf.db", autoload: true });

  // Validate the comment
  if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
  }

  // Fetch the talk by ID
  conf.getTalkById(talkId)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }

          // Construct the new comment object
          const userComment = {
              username, // Use the username from the decoded token
              comment,
              timestamp: new Date(),
          };

          // Append the new comment to the existing comments
          const updatedComments = [...(talk[0].comments || []), userComment];

          // Update the talk's comments in the database
          conf.conf.update(
              { id: talkId }, // Match the talk ID
              { $set: { comments: updatedComments } }, // Update the comments field
              {},
              (err) => {
                  if (err) {
                      console.error("Error updating comments:", err);
                      return res.status(500).json({ message: "Failed to add comment" });
                  }

                  // Send back the updated talk with comments
                  res.status(200).json({ ...talk[0], comments: updatedComments });
              }
          );
      })
      .catch((err) => {
          console.error("Error fetching talk:", err);
          res.status(500).json({ message: "Internal server error" });
      });
};

exports.editComment = (req, res) => {
  const { id: talkId, commentId } = req.params;
  const { comment } = req.body;
  const { username } = req.user;

  if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
  }

  const confDAO = require("../models/confModel");
  const conf = new confDAO({ filename: "conf.db", autoload: true });

  conf.getTalkById(talkId)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }

          const existingComment = talk[0].comments.find((c) => c.id === commentId);

          if (!existingComment || existingComment.username !== username) {
              return res.status(403).json({ message: "Unauthorized to edit this comment" });
          }

          existingComment.comment = comment;

          conf.conf.update(
              { id: talkId },
              { $set: { comments: talk[0].comments } },
              {},
              (err) => {
                  if (err) {
                      return res.status(500).json({ message: "Failed to edit comment" });
                  }
                  res.status(200).json(talk[0]);
              }
          );
      })
      .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
      });
};

exports.deleteComment = (req, res) => {
  const { id: talkId, commentId } = req.params;
  const { username } = req.user;

  const confDAO = require("../models/confModel");
  const conf = new confDAO({ filename: "conf.db", autoload: true });

  conf.getTalkById(talkId)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }

          const commentIndex = talk[0].comments.findIndex(
              (c) => c.id === commentId && c.username === username
          );

          if (commentIndex === -1) {
              return res.status(403).json({ message: "Unauthorized to delete this comment" });
          }

          talk[0].comments.splice(commentIndex, 1);

          conf.conf.update(
              { id: talkId },
              { $set: { comments: talk[0].comments } },
              {},
              (err) => {
                  if (err) {
                      return res.status(500).json({ message: "Failed to delete comment" });
                  }
                  res.status(200).json(talk[0]);
              }
          );
      })
      .catch((err) => {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
      });
};

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
