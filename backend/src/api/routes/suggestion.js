const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Suggestion = require("../models/suggestion");
const { generateSkillSuggestions } = require("../services/");

// Get current user's skill suggestions
router.get("/suggestion", auth, async (req, res) => {
 
});

module.exports = router;