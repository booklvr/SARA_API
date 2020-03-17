const mongoose = require('mongoose');

// create person schema
// * mongoose renames the schema and adds an 's' in the database
const answerSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    answer1: {
        type: String,
        required: true,
        trim: true
    },
    answer2: {
        type: String,
        required: true,
        trim: true
    },
    answer3: {
        type: String,
        required: true,
        trim: true
    },
    answer4: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, // from user Schema loggged in user,
        // required: true,
        ref: 'User' // connect to User model
    },
    questionID: {
        type: mongoose.Schema.Types.ObjectId, // from questionSchema
        // required: true,
        ref: 'Question'
    }
}, {
    timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
