const express = require("express");
const router = express.Router();
const Suggestion = require("../../models/suggestion");
const { generateSkillSuggestions } = require('../services/geminiServices/skillsuggestion');
const { generateMentorSuggestions}=  require('../services/geminiServices/mentorSuggestion');
const { generateJobSuggestions}=  require('../services/geminiServices/jobSuggestion');
const { generateCompanySuggestions}=  require('../services/geminiServices/companySuggestion');
// Get current user's skill suggestions
router.get("/suggestion", async (req, res) => {

    try {
        const skillSuggestions = await generateSkillSuggestions(req.user.id);
        suggestion.suggestedSkills = skillSuggestions;
        //await suggestion.save();
      } catch (error) {
        console.error("Error generating skill suggestions:", error.message);
      }
      
      // Generate job role suggestions
      try {
        const jobRoleSuggestions = await generateJobSuggestions(req.user.id);
        suggestion.suggestedJobRoles = jobRoleSuggestions;
        await suggestion.save();
      } catch (error) {
        console.error("Error generating job role suggestions:", error.message);
      }
      
      // Generate company suggestions
      try {
        const companySuggestions = await generateCompanySuggestions(req.user.id);
        suggestion.suggestedCompanies = companySuggestions;
        await suggestion.save();
      } catch (error) {
        console.error("Error generating company suggestions:", error.message);
      }
      
      // Generate mentor suggestions
      try {
        const mentorSuggestions = await generateMentorSuggestions(req.user.id);
        suggestion.mentorSuggestions = mentorSuggestions;
        await suggestion.save();
      } catch (error) {
        console.error("Error generating mentor suggestions:", error.message);
      }


      
      
});

module.exports = router;