const   express = require('express'),
        auth    = require('../middleware/auth'),
        User    = require('../models/user'),
        multer  = require('multer'), // required for file uploads
        sharp   = require('sharp'); // convert and resize images

const router = new express.Router();


router.get('/me', auth, async(req, res) => {
    // get user from auth middleware
    res.send(req.user);
})

// BAD ROUTE DON"T USE
// GET ALL USERS
// router.get('/', async (req, res) => {
//     try {
//         const users = await User.find({});

//         console.log(users);

//         if(!users) {
//             throw new Error();
//         }

//         res.send(users);
//     } catch (e) {
//         console.log(e);
//         res.status(404).send(e);
//     }
// })

router.post('/', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();

        // send email here later
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password); // findByCredentials => userSchema.static function

        // create user jsonwebtoken for user from /models/user.js
        const token = await user.generateAuthToken();

        // only send back public information from suerSchema.methods.toJSON()
        // send back token for session
        res.send({ user, token });
    } catch (e) {
        console.log(e);

        res.status(400).send();
    }
});

// LOGOUT USER
router.post('/logout', auth, async (req, res) => {
    try {
        // remove current session token
        // * filter tokens array by removing current token out of tokens array
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})

// LOGOUT ALL USER SESSIONS
router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
})



module.exports = router;
