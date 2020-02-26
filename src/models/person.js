const mongoose = require('mongoose');

// create person schema
// * mongoose renames the schema and adds an 's' in the database
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    food: {
        type: String,
        required: true,
        trim: true
    },
    job: {
        type: String,
        required: true,
        trim: true
    },
    skill: {
        type: String,
        required: true,
        trim: true
    },
    dinner: {
        type: String,
        required: true,
        trim: true
    },
    extra: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, // from user Schema loggged in user,
        required: true,
        ref: 'User' // connect to User model
    }
}, {
    timestamps: true
});

const Person = mongoose.model('Person', taskSchema);

module.exports = Person;
