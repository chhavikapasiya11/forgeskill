//src/api/services/geminiServices/skillSuggestion.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require('../../../models/profile');
const {SkillSuggestion} = require("../../../models/suggestion"); 
//const SkillSuggestion = mongoose.model("SkillSuggestion", SkillSuggestionSchema);
require("dotenv").config();
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

async function generateSkillSuggestions(userId) {
  try {
    const profile = await Profile.findOne({ user: userId }).populate("user", "username email");
    if (!profile) {
      throw new Error("Profile not found for this user");
    }

    const prompt = createGeminiPrompt(profile);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    const Data = parseGeminiResponse(responseText);

    const suggestedSkills = new SkillSuggestion({
      user: userId,
      data: Data,
    });

    await suggestedSkills.save();
    return suggestedSkills;
  } catch (error) {
    console.error("Error generating skill suggestions:", error);
    throw error;
  }
}



function createGeminiPrompt(profile) {
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
    "reason": "market trend", //option{enum: 'market trend', 'career progression', 'profile completion', 'job requirement', 'ai recommended',}
    "marketDemand": 85,
    "difficultyLevel": "intermediate", // (only options ='beginner', 'intermediate', 'advanced',)
    "estimatedTimeToLearn": 40,
    "relatedCourses": [  //it should be real
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


function parseGeminiResponse(responseText) {
  try {
    let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n/, "").replace(/\n```$/, "");
    }
    
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