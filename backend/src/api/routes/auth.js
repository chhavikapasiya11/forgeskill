const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Profile = require("../model/Profile");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const auth = require("../middleware/auth");

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
        // No need to specify other fields as they have defaults
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
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await Profile.findOne({ user: req.user.id });
    
    res.json({
      user,
      profile
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Update user profile
router.put(
  "/update-profile",
  [
    auth,
    // All validations are kept but none are required
    body("currentSkills").optional().isArray(),
    body("bio").optional().isString(),
    body("profileType").optional().isIn(["student", "working professional", "other"]),
    body("targetCompanies").optional().isArray(),
    body("targetSkills").optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        currentSkills,
        bio,
        profileType,
        targetCompanies,
        targetSkills
      } = req.body;

      // Build profile update object
      const profileFields = {};
      if (currentSkills !== undefined) profileFields.currentSkills = currentSkills;
      if (bio !== undefined) profileFields.bio = bio;
      if (profileType !== undefined) profileFields.profileType = profileType;
      if (targetCompanies !== undefined) profileFields.targetCompanies = targetCompanies;
      if (targetSkills !== undefined) profileFields.targetSkills = targetSkills;

      // Find and update profile
      let profile = await Profile.findOne({ user: req.user.id });
      
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
      } else {
        // Create profile if somehow it doesn't exist
        profileFields.user = req.user.id;
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

// Add experience to profile
router.put(
  "/add-experience",
  [
    auth,
    body("role").optional().isString(),
    body("company").optional().isString(),
    body("from").optional().isString(),
    body("current").optional().isBoolean(),
    body("to").optional().isString(),
    body("description").optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        role,
        company,
        from,
        to,
        current,
        description
      } = req.body;

      const newExp = {};
      if (role !== undefined) newExp.role = role;
      if (company !== undefined) newExp.company = company;
      if (from !== undefined) newExp.from = from;
      if (to !== undefined) newExp.to = to;
      if (current !== undefined) newExp.current = current;
      if (description !== undefined) newExp.description = description;

      const profile = await Profile.findOne({ user: req.user.id });
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Remove experience from profile
router.delete("/delete-experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get remove index
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

    if (removeIndex === -1) {
      return res.status(404).json({ error: "Experience not found" });
    }

    // Remove experience
    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;