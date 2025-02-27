const express = require("express");
const router = express.Router();
const Suggestion = require("../../models/suggestion");
const { generateSkillSuggestions } = require("../services/geminiServices/skillsuggestion");
const { generateMentorSuggestions } = require("../services/geminiServices/mentorSuggestion");
const { generateJobSuggestions } = require("../services/geminiServices/jobSuggestion");
const { generateCompanySuggestions } = require("../services/geminiServices/companySuggestion");

// Get current user's skill, mentor, job, and company suggestions
router.get("/suggestion", async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const userId = req.user.id;

        // Generate skill suggestions
        let suggestedSkills = [];
        try {
            suggestedSkills = await generateSkillSuggestions(userId);
        } catch (error) {
            console.error("Error generating skill suggestions:", error.message);
        }

        // Generate mentor suggestions
        let mentorSuggestions = [];
        try {
            mentorSuggestions = await generateMentorSuggestions(userId);
        } catch (error) {
            console.error("Error generating mentor suggestions:", error.message);
        }

        // Generate job role suggestions
        let suggestedJobRoles = [];
        try {
            suggestedJobRoles = await generateJobSuggestions(userId);
        } catch (error) {
            console.error("Error generating job role suggestions:", error.message);
        }

        // Generate company suggestions
        let suggestedCompanies = [];
        try {
            suggestedCompanies = await generateCompanySuggestions(userId);
        } catch (error) {
            console.error("Error generating company suggestions:", error.message);
        }

        // Deactivate old active suggestions before creating a new one
        await Suggestion.updateMany({ user: userId, isActive: true }, { isActive: false });

        // Create a new Suggestion document
        const suggestion = new Suggestion({
            user: userId,
            suggestedSkills,
            suggestedJobRoles,
            suggestedCompanies,
            mentorSuggestions
        });

        // Save the new suggestion in the database
        await suggestion.save();

        // Respond with the new suggestions
        return res.status(200).json({
            message: "Suggestions generated successfully",
            suggestions: suggestion
        });

    } catch (error) {
        console.error("Error handling suggestion route:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
