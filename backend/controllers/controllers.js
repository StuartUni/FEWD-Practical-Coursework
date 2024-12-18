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
const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~]).{8,}$/;
    return regex.test(password);
};

// -------- Register User --------
exports.registerUser = (req, res) => {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check password strength
    if (!validatePassword(password)) {
        return res.status(400).json({
            message:
                "Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
        });
    }

    // Check if the user already exists
    userDB.findOne({ $or: [{ username }, { email }] }, (err, existingUser) => {
        if (err) {
            return res.status(500).json({ message: "Database error." });
        }
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create the user object
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
        };

        // Save to database
        userDB.insert(newUser, (err, savedUser) => {
            if (err) {
                return res.status(500).json({ message: "Failed to save user." });
            }

            res.status(201).json({
                message: "User registered successfully!",
                user: { id: savedUser._id, username: savedUser.username, email: savedUser.email },
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

// exports.loginUser = (req, res) => {
//   const { username, password } = req.body;

//   console.log("Received username:", username);
//   console.log("Received password:", password);

//   const user = users.find((u) => u.username === username);

//   if (!user) {
//       console.log("User not found");
//       return res.status(400).json({ message: "Invalid username or password" });
//   }

//   console.log("Stored hashed password:", user.password);

//   const isValid = bcrypt.compareSync(password, user.password);
//   if (!isValid) {
//       console.log("Password comparison failed");
//       return res.status(400).json({ message: "Invalid username or password" });
//   }

//   console.log("Password matched successfully!");

//   const token = jwt.sign({ id: user.id, username: user.username }, "your_jwt_secret", { expiresIn: "1h" });
//   res.json({ token });
// };

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

exports.addCommentToTalk = (talkId, userId, comment, res) => {
  const confDAO = require("../models/confModel");
  const conf = new confDAO({ filename: "conf.db", autoload: true });

  conf.getTalkById(talkId)
      .then((talk) => {
          if (!talk || talk.length === 0) {
              return res.status(404).json({ message: "Talk not found" });
          }

          // Add new comment
          const userComment = {
              userId,
              comment,
              timestamp: new Date(),
          };
          const updatedComments = [...(talk[0].comments || []), userComment];

          // Update talk with new comments
          conf.conf.update(
              { id: talkId },
              { $set: { comments: updatedComments } },
              {},
              (err) => {
                  if (err) {
                      console.error("Error updating comments:", err);
                      return res.status(500).json({ message: "Failed to add comment" });
                  }

                  // Return the updated talk object
                  res.status(200).json({ ...talk[0], comments: updatedComments });
              }
          );
      })
      .catch((err) => {
          console.error("Error fetching talk:", err);
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
