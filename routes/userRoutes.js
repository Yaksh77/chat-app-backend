const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

// Register Logic
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      const user = await User.create({
        username,
        email,
        password,
        isAdmin: isAdmin || false,
      });
      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          admin: user.isAdmin,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login Logic
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = router;
