const bcrypt = require("bcrypt");

const users = [
    { id: "1", username: "user1", password: bcrypt.hashSync("password123", 10) },
    { id: "2", username: "user2", password: bcrypt.hashSync("password456", 10) },
];

module.exports = users;