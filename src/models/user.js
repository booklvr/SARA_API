const   mongoose =  require('mongoose'),
        validator = require('validator'), // validate email
        bcrypt =    require('bcryptjs'),  // has passwords
        jwt =       require('jsonwebtoken'),  // provide unique web token for session
        Person =      require('./person'); // required for delete all tasks middleware


// Create User Schema
// * name
// * email
// * password
// * age
// * tokens ( from jsonwebtoken)
// * timestamps ( as second object provided to user Schema)
// * avatar -> use multer

const userSchema = new mongoose.Schema({
    name: {
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
        required: true,
        trim: true,
        minlength: 7,
        validate(pas) {
            if(~pas.toLowerCase().indexOf('password')) { // same as (pas.toLowerCase().indexOf('password') >= 0) (~ like not);
                throw new Error('Password cannot contain password');
            }
        }
    },
    tokens: [{ // from jsonWebToken
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Only send back public data
// * .toJSON every time json data is sent back it removes user.password and user.token
userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject() // toObject === mongoose method

    // delete operator removes proeperty from object
    delete userObject.password;
    delete userObject.tokens;
    // delete userObject.avatar;

    return userObject;
}

// Create virtual connection to all Tasks created by User
// * User local field and Task foreign Field must match
userSchema.virtual('persons', {
    ref: 'Person', // refrence Person Model,
    localField: '_id', // local property that is same as foreign field (user _id);
    foreignField: 'owner' // name of thing on Task model that creates relationship (user_id);
});

// Hash the plain tet passworld before saving
userSchema.pre('save', async function (next) { // not arrow function because of this
    const user = this // easier to see than 'this'

    // check if password is modified
    if (user.isModified('password')) {
        // hash passworld before save
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

// create userToken
userSchema.methods.generateAuthToken = async function () { // not arrow function to use this
    const user = this; // simpler than 'this'
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);


    // add new tokens to user in case signed in on multiple devices
    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};

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


const User = mongoose.model('User', userSchema);

module.exports = User;
