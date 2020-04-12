const   mongoose =  require('mongoose'),
        Answer =    require('./answer'); // required for delete all answer middleware

// create person schema
// * mongoose renames the schema and adds an 's' in the database
const questionSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});


//Create virtual connection to all Answers created for Question
// * Answer local field and Question foreign Field must match
questionSchema.virtual('answers', {
    ref: 'Answer', // reference Question Model,
    localField: '_id', // local property that is same as foreign field (question _id);
    foreignField: 'questionID',
});

// DELETE user created answers when user is removed
// * can't use arrow function because of 'this'
questionSchema.pre('remove', async function (next) {
    const question = this; // for simplicity

    // delete all answers show owner is user_.id (logged in user)
    try {
        answers = await Answer.find({questionID: question._id})
        console.log(answers);
        // await Answer.deleteMany({ owner: user._id });

        next();
    } catch(e) {
        res.status(500).send();
    }
});

questionSchema.pre('findOneAndUpdate', async function(next) {
    
    console.log('findOneAndUpdate Middleware -> this', this);
    next();
})



const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
