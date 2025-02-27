const { GoogleGenerativeAI } = require("@google/generative-ai");
const Suggestion = require("../models/Suggestion");
require("dotenv").config();

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });


/**
 * Generates company suggestions based on user's job role recommendations
 * @param {string} userId - The ID of the user to generate company suggestions for
 * @returns {Promise} - Promise containing the updated suggestion document
 */
async function generateCompanySuggestions(userId) {
  try {
    // 1. Get the user's current suggestion document with job role suggestions
    let suggestion = await Suggestion.findOne({
      user: userId,
      isActive: true,
      suggestedJobRoles: { $exists: true, $ne: [] }
    }).sort({ generatedAt: -1 });
    
    if (!suggestion || !suggestion.suggestedJobRoles || suggestion.suggestedJobRoles.length === 0) {
      throw new Error("No job role suggestions found. Generate job role suggestions first.");
    }
    
    // 2. Prepare data for Gemini API
    const jobRoles = suggestion.suggestedJobRoles.map(role => ({
      title: role.title,
      matchScore: role.matchScore,
      skills: role.skillsMatch ? role.skillsMatch.map(s => s.skill) : []
    }));
    
    // 3. Get company suggestions for these job roles from Gemini
    const companySuggestions = await getCompanySuggestionsFromGemini(jobRoles);
    
    // 4. Update the suggestion document with company suggestions
    suggestion.suggestedCompanies = companySuggestions;
    await suggestion.save();
    
    return suggestion;
  } catch (error) {
    console.error("Error generating company suggestions:", error);
    throw error;
  }
}

/**
 * Get company suggestions from Gemini API based on job roles
 * @param {Array} jobRoles - The job roles to get company suggestions for
 * @returns {Promise<Array>} - Promise containing company suggestions
 */
async function getCompanySuggestionsFromGemini(jobRoles) {
  try {
    // Create prompt for Gemini
    const prompt = `
I need company suggestions for someone interested in the following job roles:
${jobRoles.map(role => `- ${role.title} (match score: ${role.matchScore}/100)`).join('\n')}

Required skills for these roles include:
${jobRoles.flatMap(role => role.skills).filter((skill, index, self) => self.indexOf(skill) === index).map(skill => `- ${skill}`).join('\n')}

For each job role, suggest 2-3 companies that would be a good match.
For each company suggestion, provide:
1. Company name
2. A reason why this company is a good match for the role
3. A match score (0-100) based on how well the company matches the role
4. Work culture description (brief)
5. Company size (startup, small, medium, large, or enterprise)
6. Key office locations (2-3 major locations)

Format your response as a valid JSON array with the following structure:
[
  {
    "name": "Company Name",
    "reason": "Reason this company is a good match for the role",
    "matchScore": 85,
    "workCulture": "Brief description of work culture",
    "companySize": 'startup', 'small', 'medium', 'large', 'enterprise',//these are valid size
    "locations": ["Location 1", "Location 2"]
  }
]

Focus on real, well-known companies that match these job roles. Respond only with the JSON array and no other text.
`;
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the response
    let cleanedResponse = responseText.trim();
    
    // If response starts with a markdown code block, extract just the JSON
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n/, "").replace(/\n```$/, "");
    }
    
    // Parse the JSON response
    const companySuggestions = JSON.parse(cleanedResponse);
    
    // Validate and format company suggestions
    return companySuggestions.map(company => ({
      name: company.name,
      reason: company.reason,
      matchScore: company.matchScore || 0,
      workCulture: company.workCulture || "",
      companySize:company.companySize,
      locations: Array.isArray(company.locations) ? company.locations : []
    }));
  } catch (error) {
    console.error("Error getting company suggestions from Gemini:", error);
    return [];
  }
}

/**
 * Validate company size to ensure it matches the enum values
 * @param {string} size - The company size to validate
 * @returns {string} - A valid company size
 */

module.exports = {
  generateCompanySuggestions
};