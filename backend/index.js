const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); 
const confDAO = require("./models/confModel");
const conf = new confDAO({ filename: process.env.CONF_FILE_PATH, autoload: true });

// Initialize the database
conf.init();

console.log("CONF_FILE_PATH:", process.env.CONF_FILE_PATH);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Import Routes
const router = require("./routes/routes");
app.use("/", router);

// Dynamic port configuration
const PORT = process.env.PORT || 3001; // Default to 3001 if PORT is not set
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}. Ctrl^c to quit.`);
});