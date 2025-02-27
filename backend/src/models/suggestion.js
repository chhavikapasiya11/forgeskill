const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the next skills suggestion schema
const SkillSuggestionSchema = new Schema({
    skill: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        enum: ['market trend', 'career progression', 'profile completion', 'job requirement', 'ai recommended'],
        default: 'ai recommended'
    },
    marketDemand: {
        type: Number, // 0-100 indicating demand in job market
        default: 0
    },
    difficultyLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    estimatedTimeToLearn: {
        type: Number, // in hours
        default: 0
    },
    relatedCourses: [{
        title: String,
        platform: String,
        url: String,
        rating: Number
    }]
});

// Define job role suggestion schema
const JobRoleSuggestionSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number, // 0-100 indicating how well user's skills match
        default: 0
    },
    skillsMatch: [{
        skill: String,
        status: {
            type: String,
            enum: ['have', 'missing', 'partial'],
            default: 'have'
        }
    }],
    avgSalary: {
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    growthPotential: {
        type: Number, // 0-100 indicating career growth potential
        default: 0
    },
    popularCompanies: [{
        name: String,
    }]
});

// Define company suggestion schema
const CompanySuggestionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    reason: {
        type: String
    },
    matchScore: {
        type: Number, // 0-100 indicating how good a fit the company is
        default: 0
    },
    workCulture: {
        type: String
    },
    companySize: {
        type: String,
        enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
        default: 'medium'
    },
    locations: [String]
});

// Define mentor suggestion schema
const MentorSuggestionSchema = new Schema({
    skill: {
        type: String,
        required: true
    },
    mentors: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        matchScore: {
            type: Number, // 0-100 indicating how good a mentor match
            default: 0
        },
        //currentRole: String,
        //company: String,
        // Only populated if the mentor has made this information public
        // contactInfo: {
        //     email: String,
        //     linkedin: String
        // }
    }]
});

// Main Suggestion Schema
const SuggestionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Next skills to learn
    suggestedSkills: [SkillSuggestionSchema],
    // Job roles that match the user's profile
    suggestedJobRoles: [JobRoleSuggestionSchema],
    // Companies that would be a good fit
    suggestedCompanies: [CompanySuggestionSchema],
    // Potential mentors for specific skills
    mentorSuggestions: [MentorSuggestionSchema],

    // Overall career insights
    //careerInsights: [{
    //     insight: String,
    //     category: {
    //         type: String,
    //         enum: ['skill gap', 'market trend', 'career path', 'learning opportunity'],
    //         default: 'skill gap'
    //     },
    //     priority: {
    //         type: String,
    //         enum: ['low', 'medium', 'high'],
    //         default: 'medium'
    //     }
    // }],
    // Metadata
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: function() {
            // Suggestions expire after 30 days by default
            return new Date(Date.now() + 30*24*60*60*1000);
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // User feedback on this suggestion
    userFeedback: {
        rating: {
            type: Number, // 1-5
        },
        comments: String,
        submittedAt: Date,
        helpful: Boolean
    }
});

// Add index for quick lookup by user
SuggestionSchema.index({ user: 1, isActive: 1 });

// Make sure there's only one active suggestion per user
SuggestionSchema.index({ user: 1, isActive: 1, generatedAt: -1 }, { 
    unique: true,
    partialFilterExpression: { isActive: true }
});

const Suggestion = mongoose.model('Suggestion', SuggestionSchema);

module.exports = Suggestion;