const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/User.modal");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await findUserByEmail(email);
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save to DB
    const newUser = await createUser(username, email, hashedPassword);

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // 3. Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { register, login };
