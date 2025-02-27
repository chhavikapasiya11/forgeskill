


const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require("../models/Profile");
const Suggestion = require("../models/Suggestion");
require("dotenv").config();

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates skill suggestions for a user based on their profile data
 * @param {string} userId - The ID of the user to generate suggestions for
 * @returns {Promise} - Promise containing the saved suggestion document
 */
async function generateSkillSuggestions(userId) {
  try {
    // 1. Fetch the user's profile
    const profile = await Profile.findOne({ user: userId }).populate("user", "username email");
    
    if (!profile) {
      throw new Error("Profile not found for this user");
    }

    // 2. Prepare the prompt for Gemini
    const prompt = createGeminiPrompt(profile);
    
    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // 4. Parse the response
    const suggestedSkills = parseGeminiResponse(responseText);
    
    // 5. Save to database
    const suggestion = new Suggestion({
      user: userId,
      source: "gemini_api",
      generationPrompt: prompt,
      nextSkills: suggestedSkills,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
      isActive: true
    });
    
    await suggestion.save();
    return suggestion;
    
  } catch (error) {
    console.error("Error generating skill suggestions:", error);
    throw error;
  }
}

/**
 * Creates a prompt for Gemini based on the user's profile
 * @param {Object} profile - The user's profile
 * @returns {string} - The prompt for Gemini
 */
function createGeminiPrompt(profile) {
  // Extract relevant information from profile
  const { currentSkills, targetSkills, profileType, experience } = profile;
  
  // Format experience for the prompt
  const formattedExperience = experience.map(exp => {
    const duration = exp.current 
      ? `${new Date(exp.from).getFullYear()} - Present` 
      : `${new Date(exp.from).getFullYear()} - ${new Date(exp.to).getFullYear()}`;
    
    return `${exp.role} at ${exp.company} (${duration})`;
  }).join("\n");
  
  // Build the prompt
  return `
You are a career and skill development AI assistant. Based on the following profile information, 
suggest 5 skills the user should learn next to advance their career.

For each skill provide:
1. The name of the skill
2. A reason for recommending it (choose from: market trend, career progression, profile completion, job requirement)
3. Market demand score (0-100)
4. Difficulty level (beginner, intermediate, or advanced)
5. Estimated time to learn in hours
6. 2-3 related courses with title, platform, URL (can be hypothetical), and rating (1-5)

Current profile information:
- Profile type: ${profileType}
- Current skills: ${currentSkills.join(", ") || "None specified"}
- Target skills: ${targetSkills.join(", ") || "None specified"}
- Professional experience:
${formattedExperience || "None specified"}

Format your response as a valid JSON array of skill objects with the following structure:
[
  {
    "skill": "Skill name",
    "reason": "market trend",
    "marketDemand": 85,
    "difficultyLevel": "intermediate",
    "estimatedTimeToLearn": 40,
    "relatedCourses": [
      {
        "title": "Course title",
        "platform": "Platform name",
        "url": "course-url",
        "rating": 4.5
      }
    ]
  }
]

Respond only with the JSON array and no other text.
`;
}

/**
 * Parses the Gemini response into a structured format
 * @param {string} responseText - The text response from Gemini
 * @returns {Array} - Parsed skill suggestions
 */
function parseGeminiResponse(responseText) {
  try {
    // Clean up the response to ensure it's valid JSON
    let cleanedResponse = responseText.trim();
    
    // If response starts with a markdown code block, extract just the JSON
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n/, "").replace(/\n```$/, "");
    }
    
    // Parse the JSON response
    const suggestedSkills = JSON.parse(cleanedResponse);
    
    // Validate the structure and ensure it matches our schema
    return suggestedSkills.map(skill => ({
      skill: skill.skill,
      reason: skill.reason,
      marketDemand: skill.marketDemand || 0,
      difficultyLevel: skill.difficultyLevel || "intermediate",
      estimatedTimeToLearn: skill.estimatedTimeToLearn || 0,
      relatedCourses: skill.relatedCourses || []
    }));
    
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return empty array in case of parsing error
    return [];
  }
}

module.exports = {
  generateSkillSuggestions
};