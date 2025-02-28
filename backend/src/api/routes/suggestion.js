const express = require("express");
const router = express.Router();
const Suggestion = require("../../models/suggestion");
const { generateSkillSuggestions } = require("../services/geminiServices/skillsuggestion");
const { findRealMentorsForSkills } = require("../services/geminiServices/mentorSuggestion");
const { generateJobRoleSuggestions } = require("../services/geminiServices/jobSuggestion");
const { generateCompanySuggestions } = require("../services/geminiServices/companySuggestion");

// Get current user's skill, mentor, job, and company suggestions
router.get("/", async (req, res) => {
    const { user } = req.body;
    console.log("routes fetched");
    try {
        // Check if user is authenticated
        if (!user || !user.id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const userId = user.id;

        // Generate skill suggestions
        let suggestedSkills = [];
        try {
            suggestedSkills = await generateSkillSuggestions(userId);
        } catch (error) {
            console.error("Error generating skill suggestions:", error.message);
        }
        console.log("recommended skill generated");

        // Generate mentor suggestions
        let mentorSuggestions = [];
        try {
            mentorSuggestions = await findRealMentorsForSkills(userId);
        } catch (error) {
            console.error("Error generating mentor suggestions:", error.message);
        }
        console.log("recommended mentor generated");

        // Generate job role suggestions
        let suggestedJobRoles = [];
        try {
            suggestedJobRoles = await generateJobRoleSuggestions(userId);
        } catch (error) {
            console.error("Error generating job role suggestions:", error.message);
        }
        console.log("recommended job generated");


        // Generate company suggestions
        // let suggestedCompanies = [];
        // try {
        //     suggestedCompanies = await generateCompanySuggestions(userId);
        // } catch (error) {
        //     console.error("Error generating company suggestions:", error.message);
        // }
        // console.log("recommended company generated");

        // Deactivate old active suggestions before creating a new one
        //await Suggestion.updateMany({ user: userId, isActive: true }, { isActive: false });

        // Create a new Suggestion document
        const suggestion =({
            user: userId,
            suggestedSkill:suggestedSkills,
            suggestedMentor:mentorSuggestions,
            suggestedJobs:suggestedJobRoles,
            //mentorSuggestions
        });

        // Save the new suggestion in the database
        //await suggestion.save();

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
