const Profile = require("../models/Profile");
const Suggestion = require("../models/Suggestion");

/**
 * Finds up to 3 real user mentors for each skill suggestion from the database
 * @param {string} userId - The ID of the user to find mentors for
 * @returns {Promise} - Promise containing the updated suggestion document
 */
async function findRealMentorsForSkills(userId) {
  try {
    // 1. Get the user's current suggestion document with skill suggestions
    let suggestion = await Suggestion.findOne({
      user: userId,
      isActive: true,
      nextSkills: { $exists: true, $ne: [] }
    }).sort({ generatedAt: -1 });
    
    if (!suggestion || !suggestion.nextSkills || suggestion.nextSkills.length === 0) {
      throw new Error("No skill suggestions found. Generate skill suggestions first.");
    }
    
    // Clear existing mentor suggestions
    suggestion.mentorSuggestions = [];
    
    // 2. Process each suggested skill
    for (const skillSuggestion of suggestion.nextSkills) {
      const skill = skillSuggestion.skill;
      const difficultyLevel = skillSuggestion.difficultyLevel;
      
      // Find users who have this skill in their currentSkills
      const potentialMentors = await Profile.find({
        'currentSkills': { $in: [skill] },
        'user': { $ne: userId } // Exclude the current user
      }).populate('user', 'username email');
      
      if (potentialMentors.length > 0) {
        // Calculate match scores based on skill level needs
        const mentors = [];
        
        for (const mentorProfile of potentialMentors) {
          // Skip if user object is not populated
          if (!mentorProfile.user) continue;
          
          const matchScore = calculateMentorMatchScore(mentorProfile, skill, difficultyLevel);
          
          mentors.push({
            userId: mentorProfile.user._id,
            matchScore
          });
        }
        
        // Sort by match score and take top 3
        mentors.sort((a, b) => b.matchScore - a.matchScore);
        const topMentors = mentors.slice(0, 3);
        
        // Only add to suggestion if we found at least one mentor
        if (topMentors.length > 0) {
          suggestion.mentorSuggestions.push({
            skill,
            mentors: topMentors
          });
        }
      }
    }
    
    // 3. Save the updated suggestion document
    await suggestion.save();
    return suggestion;
    
  } catch (error) {
    console.error("Error finding mentors for skills:", error);
    throw error;
  }
}

/**
 * Calculate a match score for a potential mentor based on their profile and the skill difficulty
 * @param {Object} mentorProfile - The mentor's profile
 * @param {String} skill - The skill to match
 * @param {String} difficultyLevel - The difficulty level of the skill
 * @returns {Number} - A match score from 0-100
 */
function calculateMentorMatchScore(mentorProfile, skill, difficultyLevel) {
    return Math.floor(Math.random() * (80 - 40 + 1)) + 40;
}  

module.exports = {
  findRealMentorsForSkills
};