
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the Experience Schema (for the experience array)
const ExperienceSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date
    },
    current: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    }
});

// Define the Profile Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true // Keep this required to maintain the relationship with User
    },
    currentSkills: {
        type: [String],
        required: false, // Changed from required: true
        default: []
    },
    bio: {
        type: String,
        default: ""
    },
    profileType: {
        type: String,
        enum: ['student', 'working professional', 'other'],
        required: false, // Changed from required: true
        default: "other"
    },
    experience: {
        type: [ExperienceSchema],
        default: []
    },
    targetCompanies: {
        type: [String],
        default: []
    },
    targetSkills: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// Update the updatedAt field on save
ProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;