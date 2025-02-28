const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure API key is set
if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in environment variables.");
    process.exit(1);
}

// Instantiate Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define Gemini Model Configuration
const geminiConfig = {
    model: "gemini-2.0-flash",
    settings: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
    },
    retry: {
        maxRetries: 3,
        initialDelay: 1000, // 1 second
        maxDelay: 5000      // 5 seconds
    }
};

// Create a function to get the Gemini model
const getGeminiModel = () => {
    return genAI.getGenerativeModel({
        model: geminiConfig.model,
        generationConfig: geminiConfig.settings
    });
};

module.exports = { genAI, geminiConfig, getGeminiModel };
