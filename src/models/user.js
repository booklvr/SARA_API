const   mongoose =              require('mongoose'),
        validator =             require('validator'), // validate email
        bcrypt =                require('bcryptjs'),  // has passwords
        passportLocalMongoose = require('passport-local-mongoose'),
        // jwt =           require('jsonwebtoken'),  // provide unique web token for session
        Answer =                require('./answer'), // required for delete all answer middleware
        Question =              require('./question'),
        geocoder =              require('../utils/geocoder');
        


// Create User Schema
// * name
// * email
// * password
// * age
// * tokens ( from jsonwebtoken)
// * timestamps ( as second object provided to user Schema)
// * avatar -> use multer

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) { // validator is an npm package
                throw new Error('Must provide an email');
            }
        }
    },
    password: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        // validate(pas) {
        //     if(~pas.toLowerCase().indexOf('password')) { // same as (pas.toLowerCase().indexOf('password') >= 0) (~ like not);
        //         throw new Error('Password cannot contain password');
        //     }
        // }
    },
    unformattedAddress: {
        type: String,
        // required: true// required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
    },
    // tokens: [{ // from jsonWebToken
    //     token: {
    //         type: String,
    //         required: true
    //     }
    // }],
    avatar: {
        type: Buffer // for storing profile pics -> multer does all verification
    }
}, {
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

// Only send back public data
// * .toJSON every time json data is sent back it removes user.password and user.token
userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject() // toObject === mongoose method

    // delete operator removes proeperty from object
    delete userObject.password;
    // delete userObject.location;
    delete userObject.avatar;

    return userObject;
}

// Create virtual connection to all Answers created by User
// * User local field and Answer foreign Field must match
userSchema.virtual('answers', {
    ref: 'Answer', // refrence Answer Model,
    localField: '_id', // local property that is same as foreign field (user _id);
    foreignField: 'owner' // name of thing on Answer model that creates relationship (user_id);
});

userSchema.virtual('questions', {
    ref: 'Question', // refrence Question Model,
    localField: '_id', // local property that is same as foreign field (user _id);
    foreignField: 'owner' // name of thing on Answer model that creates relationship (user_id);
});


// Hash the plain tet passworld before saving
// userSchema.pre('save', async function (next) { // not arrow function because of this
//     const user = this // easier to see than 'this'

//     // check if password is modified
//     if (user.isModified('password')) {
//         // hash passworld before save
//         user.password = await bcrypt.hash(user.password, 8);
//     }
    
//     next();
// });

// create userToken
// userSchema.methods.generateAuthToken = async function () { // not arrow function to use this
//     const user = this; // simpler than 'this'
//     const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);


//     // add new tokens to user in case signed in on multiple devices
//     user.tokens = user.tokens.concat({ token });
    
//     await user.save();

//     return token;
// };

userSchema.methods.generateLocation = async function () {
    const user = this; // simpler than this

    // add user formatted location and remove leading comma and whitespace
    const loc = await geocoder.geocode(user.unformattedAddress);
    user.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress.replace(/^[,][ ,]/, '')
    }

    user.unformattedAddress = undefined;

    // await user.save();
    return user.location;
}

// LOGIN
// validate user by email and password for login
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
}

// DELETE user created answers when user is removed
// * can't use arrow function because of 'this'
userSchema.pre('remove', async function (next) {
    const user = this; // for simplicity

    // delete all answers show owner is user_.id (logged in user)
    try {
        await Answer.deleteMany({ owner: user._id });

        next();
    } catch(e) {
        res.status(500).send();
    }
});

userSchema.pre('remove', async function (next) {
    const user = this;

    // delete the question set associated with user._id (logged in user);
    try {
        await Question.deleteOne({ owner: user._id });

        next();
    } catch (e) {
        console.log("e", e)
        res.status(500).send();
    }
})


const User = mongoose.model('User', userSchema);

module.exports = User;
