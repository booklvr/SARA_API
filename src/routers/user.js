const   express     = require('express'),
        multer      = require('multer'), // required for file uploads
        sharp       = require('sharp'), // convert and resize images
        passport    = require('passport'),
        auth        = require('../middleware/auth'),
        User        = require('../models/user'),
        Question    = require('../models/question'),
        upload      = require('../middleware/avatar.multer'),
        geocoder    = require('../utils/geocoder'),
        card        = require('../utils/cards');
        
        
const { isLoggedIn, signInOrRegister } = require('../middleware/auth');

const router = new express.Router();



router.get('/me', signInOrRegister, async(req, res) => {
    // get user from auth middleware
    try {
        const user = await User.findById(req.user._id);
        // console.log("user", user)
        
        const questions = await Question.findOne({owner: req.user._id});

        let answers = undefined;
        let cards = [];

        if (questions) {
            await questions.populate({
                path: 'answers' // populate answers to this question
            }).execPopulate();

            answers = questions.answers;

            cards = await card.buildCards(answers);
            
        }
        res.render('pages/profile', {user, questions, cards})

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
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

router.post('/', async (req, res, next) => {
    console.log('registering user');
    
    try {
        if (req.body.password !== req.body.confirm) {
            throw new Error('passwords do not match');
        }

        const newUser = {
            ...req.body
        }
        delete newUser.confirm;
        delete newUser.password;

        const user = new User(newUser);
        await user.generateLocation();
        
        User.register(user, req.body.password, (err, user) => {
            if (err) {
                console.log('error while registering user: ', err)
                return res.render('pages/register')
            } 
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "successfully signed up! nice to meet you " + req.body.username);
                res.redirect('./addAvatar');
            });
            // {
            //     failureRedirect: "/",
            //     failureFlash: true,
            //     successFlash: "Welcome to Ask Your Questions."
            // }), function(req, res){
            //     console.log('i am here')
            //     res.redirect('../addAvatar')
            // }
            
            // res.redirect('../addAvatar')
        });
    } catch (err) {
        console.log("err", err); 
        res.status(500).send({error: 'server error'});
    }
});

router.post('/login', passport.authenticate("local", 
    {
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Try answering some questions."
    }), function(req, res){
        res.redirect('/users/me')
})


// LOGOUT USER
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'See you later!');
    res.redirect('/');
})

// LOGOUT ALL USER SESSIONS
router.post('/logoutAll', async (req, res) => {
    try {
        req.user.tokens = [];

        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

// UPDATE USER
router.post('/me/update', signInOrRegister, async (req, res) => {
    // what is allowed to update
    const updates = Object.keys(req.body) // returns list of keys from req.body
    // console.log(updates);
    const allowedUpdates = ['email', 'unformattedAddress'];
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
        await req.user.generateLocation();
        await req.user.save();
        res.redirect('/users/me');
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.get('/confirmDelete', signInOrRegister, (req, res) => {
    const data = {
        title: "Delete your Account",
        url: "/users/confirmDelete",
        input1: "delete",
        input2: "cancel",
        name: "delete",
        message: "Are you sure you want to delete you account?",
        message2: "If you delete your account, your questions and all answers associated with your account will be removed."
    }

    res.render('pages/formConfirm', { data });
});

// POST CONFIRM DELETE
router.post('/confirmDelete', signInOrRegister, async (req, res) => {
    
    req.body.delete === "delete" ? res.redirect('./me/delete') : res.redirect('./me');

});

router.get('/me/delete', signInOrRegister, async (req, res) => {
    console.log('deleting user');
    
    try {
        // const user = await User.findOne({ _id: req.user._id} );
        // user.deleteOne();
        const userToDelete = await User.findById(req.user._id);
        console.log('iniate full deletion cascade with deleteOne hooks');
        const deletedUser = await userToDelete.deleteOne();
        console.log(deletedUser);
        // const user = User.findById(req.user._id);
        // const deletedUser = user.deleteOne();
        // // const deletedUser = await User.deleteOne({ _id: req.user._id});
        // console.log("deletedUser", deletedUser)
        
        req.logOut();
        
        res.clearCookie('sid', {path: '../../'})
        
        req.flash('success', 'Sorry to see you go.');
        res.redirect('../../');
    } catch (e) {
        res.status(500).redirect('/');
    }
});

router.get('/addAvatar', signInOrRegister, (req, res) => {
    res.render("pages/addAvatar");
})

// POST AVATAR
// * upload.single() is middlware provided by multer
// -> upload.single() requires an arguemnt we are just calling upload
// -> 'upload' must match key value in req.body (key value pair in postman)
router.post('/me/avatar', signInOrRegister, upload.single('avatar'), async (req, res) => {  // async for req.user.save()
    
  // * use sharp to resize photo and convert to png format
  //  -> req.file.buffer is from multer and contains binary info form the image uploaded
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();

        req.user.avatar = buffer;
        await req.user.save();  // save file to user profile

        const questions = await Question.findOne({owner: req.user._id});
        if (questions) {
            res.redirect('/users/me')
        } else {
            res.redirect('../../questions/');
        }
        
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
router.delete('/me/avatar', async (req, res) => {

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
        const locations = [];

        await Promise.all(users.map(async (user) => {
            try {
                await user.populate({
                    path: 'questions' // populate questions
                }).execPopulate();
            } catch (err) {
                console.log(err);
            }
            const result = {};
            result.username = user.username;
            result.location = user.location;
            result.id = user._id;
            if(user.questions[0]) {
                result.questions = user.questions[0];
            }
            // result.questions = user.questions[0];

            locations.push(result);

        }))

        res.status(200).send(locations); 
    } catch(err) {
        console.log(err);
    }
})

router.get('/formatLocation/:location', async (req, res) => {
    try {
        const loc = await geocoder.geocode(req.params.location);

        res.send({data:loc[0].formattedAddress.replace(/[,]+/g, '').trim()})

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})


module.exports = router;
