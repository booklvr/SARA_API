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
            if(~pas.toLowerCAse().indexOf('password')) { // same as (pas.toLowerCase().indexOf('password') >= 0) (~ like not);
                throw new Error('Password cannot contain password');
            }
        }
    }
})
