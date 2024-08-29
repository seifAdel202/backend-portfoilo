const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name.'],
        trim: true
    },
    titleHome: {
        type: String,
        required: [true, 'Please provide a title.']
    },
    pForTitle: {
        type: String,
        required: [true, 'Please provide a subtitle.']
    },
    cvLink: {
        type: String,
        required: [true, 'Please provide your CV link.'],
        validate: [validator.isURL, 'Please provide a valid URL for your CV.']
    },
    aboutMe: {
        type: String,
        required: [true, 'Please provide information about yourself.']
    },
    linkedInLink: {
        type: String,
        required: [true, 'Please provide your LinkedIn link.'],
        validate: [validator.isURL, 'Please provide a valid LinkedIn URL.']
    },
    softSkill: {
        type: [String],
        required: [true, 'Please provide your soft skills.']
    },
    techSkill: {
        type: [String],
        required: [true, 'Please provide your technical skills.']
    },
    projects: [{
        projectTitle: {
            type: String,
            required: [true, 'Please provide a project title.']
        },
        projectDescription: {
            type: String,
            required: [true, 'Please provide a project description.']
        },
        projectImage: {
            type: String,
            validate: [validator.isURL, 'Please provide a valid URL for the project image.']
        },
        projectLink: {
            type: String,
            validate: [validator.isURL, 'Please provide a valid URL for the project link.']
        }
    }],
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;
