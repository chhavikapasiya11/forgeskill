const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Suggestion = require("../models/Suggestion");
const { generateSkillSuggestions } = require("../utils/skillSuggestionGenerator");

// Get current user's skill suggestions
router.get("/skills", auth, async (req, res) => {
  try {
    // Find the most recent active suggestion for the user
    const suggestion = await Suggestion.findOne({
      user: req.user.id,
      isActive: true
    }).sort({ generatedAt: -1 });
    
    if (!suggestion) {
      return res.status(404).json({ 
        message: "No skill suggestions found. Generate new suggestions first." 
      });
    }
    
    // Check if suggestions have expired
    if (new Date() > suggestion.expiresAt) {
      return res.status(410).json({
        message: "Skill suggestions have expired. Please generate new suggestions.",
        expired: true
      });
    }
    
    res.json({
      nextSkills: suggestion.nextSkills,
      generatedAt: suggestion.generatedAt
    });
  } catch (error) {
    console.error("Error fetching skill suggestions:", error.message);
    res.status(500).send("Server Error");
  }
});

// Generate new skill suggestions
router.post("/skills/generate", auth, async (req, res) => {
  try {
    // Mark any existing active suggestions as inactive
    await Suggestion.updateMany(
      { user: req.user.id, isActive: true },
      { $set: { isActive: false } }
    );
    
    // Generate new suggestions
    const newSuggestion = await generateSkillSuggestions(req.user.id);
    
    res.json({
      message: "Successfully generated new skill suggestions",
      nextSkills: newSuggestion.nextSkills,
      generatedAt: newSuggestion.generatedAt
    });
  } catch (error) {
    console.error("Error generating skill suggestions:", error.message);
    res.status(500).json({ 
      error: "Failed to generate skill suggestions",
      message: error.message
    });
  }
});

// Provide feedback on skill suggestions
router.post("/skills/feedback", auth, async (req, res) => {
  try {
    const { rating, comments, helpful } = req.body;
    
    // Find the most recent active suggestion
    const suggestion = await Suggestion.findOne({
      user: req.user.id,
      isActive: true
    }).sort({ generatedAt: -1 });
    
    if (!suggestion) {
      return res.status(404).json({ 
        message: "No active skill suggestions found to provide feedback on." 
      });
    }
    
    // Update with feedback
    suggestion.userFeedback = {
      rating,
      comments,
      helpful,
      submittedAt: new Date()
    };
    
    await suggestion.save();
    
    res.json({
      message: "Feedback recorded successfully",
      suggestion: {
        id: suggestion._id,
        nextSkills: suggestion.nextSkills,
        userFeedback: suggestion.userFeedback
      }
    });
  } catch (error) {
    console.error("Error saving suggestion feedback:", error.message);
    res.status(500).send("Server Error");
  }
});

// Get suggestion history
router.get("/skills/history", auth, async (req, res) => {
  try {
    const suggestions = await Suggestion.find({
      user: req.user.id
    })
    .select("nextSkills generatedAt expiresAt isActive userFeedback")
    .sort({ generatedAt: -1 })
    .limit(10);
    
    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestion history:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;