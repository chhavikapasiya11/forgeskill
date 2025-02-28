const Profile = require('../../../models/profile');
const {MentorSuggestion} = require("../../../models/suggestion"); 
const {SkillSuggestion} = require("../../../models/suggestion"); // Ensure this model exists

// Function to find mentors for skills
async function findRealMentorsForSkills(userId) {
    try {
      const suggestion = await SkillSuggestion.findOne({ user: userId }).sort({ generatedAt: -1 });
  
      if (!suggestion || !suggestion.data || suggestion.data.length === 0) {
        throw new Error("No skill suggestions found. Generate skill suggestions first.");
      }
  
      const data = [];
  
      for (const skills of suggestion.data) {
        const skill = skills.skill;
        const difficultyLevel = skills.difficultyLevel;
  
        // Find mentors
        const potentialMentors = await Profile.find({
          currentSkills: { $in: [skill] },
          user: { $ne: userId },
        }).populate("user", "username email");
  
        if (potentialMentors.length > 0) {
          const mentors = [];
  
          for (const mentorProfile of potentialMentors) {
            if (!mentorProfile.user) continue;
  
            const matchScore = calculateMentorMatchScore(mentorProfile, skill, difficultyLevel);
            mentors.push({
              userId: mentorProfile.user._id,
              matchScore,
            });
          }
  
          mentors.sort((a, b) => b.matchScore - a.matchScore);
          const topMentors = mentors.slice(0, 3);
  
          if (topMentors.length > 0) {
            data.push({
              skill: skill,
              mentors: topMentors,
            });
          }
        }
      }
  
      const mentorSuggestion = new MentorSuggestion({
        user: userId,
        data: data,
      });
  
      await mentorSuggestion.save();
      return mentorSuggestion;
    } catch (error) {
      console.error("Error finding mentors for skills:", error);
      throw error;
    }
  }

function calculateMentorMatchScore(mentorProfile, skill, difficultyLevel) {
    return Math.floor(Math.random() * (80 - 40 + 1)) + 40;
}  

module.exports = {
  findRealMentorsForSkills
};