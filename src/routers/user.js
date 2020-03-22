const   express = require('express'),
        auth    = require('../middleware/auth'),
        User    = require('../models/user'),
        multer  = require('multer'), // required for file uploads
        sharp   = require('sharp'), // convert and resize images
        upload  = require('../middleware/avatar.multer');

const router = new express.Router();


router.get('/me', auth, async(req, res) => {
    // get user from auth middleware
    res.send(req.user);
})

// BAD ROUTE DON"T USE
// GET ALL USERS
router.get('/', async (req, res) => {
    try {
        const users = await User.find({});

        console.log(users);

        if(!users) {
            throw new Error();
        }

        res.send(users);
    } catch (e) {
        console.log(e);
        res.status(404).send(e);
    }
})

router.post('/', async (req, res) => {
    
    try {
        // const user = await User.create(req.body);
        const user = new User(req.body);
        // await user.save();

        // const user = await User.create(req.body);

        // const token = await user.generateAuthToken();

        // return res.status(201).json({
        //     success: true,
        //     data: {
        //         user,
        //         token
        //     }
        // })

        // send email here later
        const token = await user.generateAuthToken();
        const location = await user.generateLocation();
        res.status(201).send({ user, token});
    } catch (e) {
        console.log("e", e);   
        res.status(500).send({error: 'server error'});
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
});


// UPDATE USER
router.patch('/me', auth, async (req, res) => {
    // what is allowed to update
    const updates = Object.keys(req.body) // returns list of keys from req.body
    console.log(updates);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!' });
    }

    // use findById for password hashing middleware or mongoose bypasses middleware with findByIdAndUpdate
    try {
        //get user from auth middleware req.user
        // update each field provided by req.body
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// POST AVATAR
// * upload.single() is middlware provided by multer
// -> upload.single() requires an arguemnt we are just aclling upload
// -> 'upload' must match key value in req.body (key value pair in postman)
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {  // async for req.user.save()

  // * use sharp to resize photo and convert to png format
  //  -> req.file.buffer is from multer and contains binary info form the image uploaded
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();

    req.user.avatar = buffer;
    await req.user.save();  // save file to user profile
    res.send();
}, (error, req, res, next) => { // all four arguments needed so express knows to expect an error
    res.status(400).send({error: error.message }); // error from upload.single multer middleware
})

// GET AVATAR
// image available at URL just include in image src in html markup
router.get('/:id/avatar', async (req, res) => {

    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            throw new Error(); // no error message because not sending error message bellow
        }

        // create response header
        // * res.set takes in key value pair { nameOfResponseHeader; valueTryingToSet}
        res.set('Content-Type', 'image/png'); // we know it is png because we convereted using sharp in postroute
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

// // UPDATE AVATAR   ??? DO I EVEN NEED THIS??? IT IS THE SAME AS POST
// router.patch('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
//     // async for req.user.save()
//     // * use sharp to resize phto and convert to png format
//     const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

//     req.user.avatar = buffer;
//     await req.user.save(); // save file to user profile
//     res.send();
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
// })


// DELETE AVATAR
router.delete('/me/avatar', auth, async (req, res) => {

    try {
        // remove ausing express remove() and req.user from auth middleware
        req.user.avatar = undefined; // this deletes binary data from req.user.avatar
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});

// Get Locations
router.get('/locations', async (req, res) => {
    try {
        const users = await User.find({});
        // console.log("users", users);

        if (!users) {
            throw new Error("No users");
        }
        // console.log(users);  
        locations = users.map((user) => {
            // console.log("user", user)
            return {name: user.name, location: user.location, id: user._id}
            // return {user.name, user.location};
        })
        
        // console.log(locations);
        

        res.status(200).send(locations); 
    } catch(err) {
        console.log(err);
    }
})


module.exports = router;
