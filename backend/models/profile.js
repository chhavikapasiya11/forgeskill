//models/profile.js

// ref user model
// current skill string[]
//bio
//what describe u :option:student,working prof ,other etc
//experience: [arr] //role+comp
//target comp []
//target skill[]

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
        required: true
    },
    currentSkills: {
        type: [String],
        required: true
    },
    bio: {
        type: String
    },
    profileType: {
        type: String,
        enum: ['student', 'working professional', 'other'],
        required: true
    },
    experience: [ExperienceSchema],
    targetCompanies: {
        type: [String]
    },
    targetSkills: {
        type: [String]
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