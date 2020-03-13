const   mongoose =  require('mongoose'),
        Answer =    require('./answer'); // required for delete all answer middleware

// create person schema
// * mongoose renames the schema and adds an 's' in the database
const questionSchema = new mongoose.Schema({
    question1: {
        type: String,
        required: true,
        trim: true
    },
    question2: {
        type: String,
        required: true,
        trim: true
    },
    question3: {
        type: String,
        required: true,
        trim: true
    },
    question4: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, // from user Schema loggged in user,
        // required: true,
        ref: 'User' // connect to User model
    }
}, {
    timestamps: true
});

// Create virtual connection to all Answers created by User
// * User local field and Answer foreign Field must match
questionSchema.virtual('answer', {
    ref: 'Answer', // refrence Answer Model,
    localField: '_id', // local property that is same as foreign field (user _id);
    foreignField: 'question' // name of thing on Answer model that creates relationship (user_id);
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
