const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require("../../../models/profile");
const {JobRoleSuggestion} = require("../../../models/suggestion"); 

require("dotenv").config();

// Initialize Gemini API
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);


async function generateJobRoleSuggestions(userId) {
    try {
      // 1. Fetch the user's profile
      const profile = await Profile.findOne({ user: userId }).populate("user", "username email");
      const job = await JobRoleSuggestion.findOne({user: userId})
      if (job) {
        await JobRoleSuggestion.deleteOne({ _id: job._id }); // Deletes the found job
        console.log("Job role suggestion deleted successfully.");
      } else {
        console.log("No job role suggestion found for the user.");
      }
      if (!profile) {
        throw new Error("Profile not found for this user");
      }
  
      // 2. Prepare the prompt for Gemini
      const prompt = createJobRolePrompt(profile);
      
      // 3. Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // 4. Parse the response
      const Data = parseGeminiResponse(responseText);
      
      // 5. Structure the data for saving
      const jobRoleSuggestions = new JobRoleSuggestion({
        user: userId,
        data: Data
      });
  
      // 6. Save to database
      await jobRoleSuggestions.save();
  
      return jobRoleSuggestions;
      
    } catch (error) {
      console.error("Error generating job role suggestions:", error);
      throw error;
    }
  }
  
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


function parseGeminiResponse(responseText) {
  try {
    let cleanedResponse = responseText.trim();
    
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n/, "").replace(/\n```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n/, "").replace(/\n```$/, "");
    }
    
    // Parse the JSON response
    const generateJobRoleSuggestions = JSON.parse(cleanedResponse);
    
    // Validate the structure and ensure it matches our schema
    return generateJobRoleSuggestions.map(jobRole => ({
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
    return [];
  }
}

module.exports = {
  generateJobRoleSuggestions
};