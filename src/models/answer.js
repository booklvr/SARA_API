const mongoose = require('mongoose');

// create person schema
// * mongoose renames the schema and adds an 's' in the database
const answerSchema = new mongoose.Schema({
    item1: {
        type: String,
        required: true,
        trim: true
    },
    item2: {
        type: String,
        required: true,
        trim: true
    },
    item3: {
        type: String,
        required: true,
        trim: true
    },
    item4: {
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
