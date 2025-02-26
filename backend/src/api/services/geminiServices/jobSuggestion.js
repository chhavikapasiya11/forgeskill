const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require("../models/Profile");
const Suggestion = require("../models/Suggestion");
require("dotenv").config();

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates job role suggestions for a user based on their profile data
 * @param {string} userId - The ID of the user to generate suggestions for
 * @returns {Promise} - Promise containing the saved suggestion document
 */
async function generateJobRoleSuggestions(userId) {
  try {
    // 1. Fetch the user's profile
    const profile = await Profile.findOne({ user: userId }).populate("user", "username email");
    
    if (!profile) {
      throw new Error("Profile not found for this user");
    }

    // 2. Prepare the prompt for Gemini
    const prompt = createJobRolePrompt(profile);
    
    // 3. Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // 4. Parse the response
    const suggestedJobRoles = parseGeminiResponse(responseText);
    
    // 5. Save to database
    // First, check if there's an existing active suggestion for this user
    let suggestion = await Suggestion.findOne({
      user: userId,
      isActive: true
    });
    
    if (suggestion) {
      // Update existing suggestion with job roles
      suggestion.suggestedJobRoles = suggestedJobRoles;
      suggestion.updatedAt = new Date();
    } else {
      // Create new suggestion document
      suggestion = new Suggestion({
        user: userId,
        source: "gemini_api",
        generationPrompt: prompt,
        suggestedJobRoles: suggestedJobRoles,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
        isActive: true
      });
    }
    
    await suggestion.save();
    return suggestion;
    
  } catch (error) {
    console.error("Error generating job role suggestions:", error);
    throw error;
  }
}

/**
 * Creates a prompt for Gemini based on the user's profile to suggest job roles
 * @param {Object} profile - The user's profile
 * @returns {string} - The prompt for Gemini
 */
function createJobRolePrompt(profile) {
  // Extract relevant information from profile
  const { currentSkills, targetSkills, profileType, experience } = profile;
  
  // Format experience for the prompt
  const formattedExperience = experience.map(exp => {
    const duration = exp.current 
      ? `${new Date(exp.from).getFullYear()} - Present` 
      : `${new Date(exp.from).getFullYear()} - ${new Date(exp.to).getFullYear()}`;
    
    return `${exp.role} at ${exp.company} (${duration})${exp.description ? ': ' + exp.description : ''}`;
  }).join("\n");
  
  // Build the prompt
  return `
You are a career advisor AI assistant. Based on the following profile information, 
suggest 5 job roles that would be a good match for this user.

For each job role provide:
1. The exact title of the role
2. A match score (0-100) indicating how well the user's current skills match this role
3. A list of skills they already have for this role with status "have"
4. A list of skills they are missing with status "missing"
5. A list of skills they partially have with status "partial"
6. Average salary information (amount and currency)
7. Growth potential score (0-100)
8. 3-5 popular companies that hire for this role, with company names an

Current profile information:
- Profile type: ${profileType}
- Current skills: ${currentSkills.join(", ") || "None specified"}
- Target skills: ${targetSkills.join(", ") || "None specified"}
- Professional experience:
${formattedExperience || "None specified"}

Format your response as a valid JSON array of job role objects with the following structure:
[
  {
    "title": "Job Title",
    "matchScore": 75,
    "skillsMatch": [
      {
        "skill": "Skill Name",
        "status": "have"
      },
      {
        "skill": "Another Skill",
        "status": "missing"
      },
      {
        "skill": "Partial Skill",
        "status": "partial"
      }
    ],
    "avgSalary": {
      "amount": 85000,
      "currency": "USD"
    },
    "growthPotential": 80,
    "popularCompanies": [
      {
        "name": "Company Name"
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
 * @returns {Array} - Parsed job role suggestions
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
    const suggestedJobRoles = JSON.parse(cleanedResponse);
    
    // Validate the structure and ensure it matches our schema
    return suggestedJobRoles.map(jobRole => ({
      title: jobRole.title,
      matchScore: jobRole.matchScore || 0,
      skillsMatch: Array.isArray(jobRole.skillsMatch) ? jobRole.skillsMatch.map(skill => ({
        skill: skill.skill,
        status: ['have', 'missing', 'partial'].includes(skill.status) ? skill.status : 'have'
      })) : [],
      avgSalary: {
        amount: jobRole.avgSalary?.amount || 0,
        currency: jobRole.avgSalary?.currency || 'USD'
      },
      growthPotential: jobRole.growthPotential || 0,
      popularCompanies: Array.isArray(jobRole.popularCompanies) ? jobRole.popularCompanies.map(company => ({
        name: company.name,
        websiteUrl: company.websiteUrl
      })) : []
    }));
    
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return empty array in case of parsing error
    return [];
  }
}

module.exports = {
  generateJobRoleSuggestions
};