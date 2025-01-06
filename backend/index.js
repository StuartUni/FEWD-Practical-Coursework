const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); 

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