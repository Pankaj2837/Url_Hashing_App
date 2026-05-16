import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/User.modal.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await findUserByEmail(email);
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });
    console.log("object", user);
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ userId: user.UserId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ token, username: user.username });
  } catch (error) {
    console.log("!!! LOGIN CONTROLLER CRASHED !!!");
    console.error(error);
    res.status(500).json({
      message: "Login failed",
      stack: error.stack,
      detail: error.message,
    });
  }
};

export { register, login };
