const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const getUserFromToken = (req) => {
  const token = req.header("Authorization");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Register a new user with automatic profile creation
router.post(
  "/signup",
  [
    body("username").isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array()});
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) return res.status(400).json({ error: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      
      // Create the user
      user = new User({
        username: req.body.username,
        email: req.body.email,
        password: secPass
      });
      await user.save();

      // Create an empty profile for the user
      const profile = new Profile({
        user: user.id
      });
      await profile.save();

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ 
        token,
        message: "Account created successfully with empty profile" 
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Login a user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").exists().withMessage("Password required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Get current user with profile
router.get("/me", async (req, res) => {
  const userId = getUserFromToken(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await User.findById(userId).select("-password");
    const profile = await Profile.findOne({ user: userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user, profile });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Update user profile
router.put(
  "/update-profile",
  [
    body("currentSkills").optional().isArray(),
    body("bio").optional().isString(),
    body("profileType").optional().isIn(["student", "working professional", "other"]),
    body("targetCompanies").optional().isArray(),
    body("targetSkills").optional().isArray(),
  ],
  async (req, res) => {
    const userId = getUserFromToken(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { currentSkills, bio, profileType, targetCompanies, targetSkills } = req.body;

      const profileFields = { user: userId };
      if (currentSkills !== undefined) profileFields.currentSkills = currentSkills;
      if (bio !== undefined) profileFields.bio = bio;
      if (profileType !== undefined) profileFields.profileType = profileType;
      if (targetCompanies !== undefined) profileFields.targetCompanies = targetCompanies;
      if (targetSkills !== undefined) profileFields.targetSkills = targetSkills;

      let profile = await Profile.findOne({ user: userId });

      if (profile) {
        profile = await Profile.findOneAndUpdate({ user: userId }, { $set: profileFields }, { new: true });
      } else {
        profile = new Profile(profileFields);
        await profile.save();
      }

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;