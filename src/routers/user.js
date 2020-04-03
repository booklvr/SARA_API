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
        
        
const { isLoggedIn } = require('../middleware/auth');

const router = new express.Router();



router.get('/me', isLoggedIn, async(req, res) => {
    // get user from auth middleware
    try {
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
        res.render('pages/profile', {currentUser: req.user, questions, cards})

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
                res.redirect('../addAvatar');
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
router.patch('/me', isLoggedIn, async (req, res) => {
    // what is allowed to update
    const updates = Object.keys(req.body) // returns list of keys from req.body
    console.log(updates);
    const allowedUpdates = ['name', 'email', 'password', 'unformattedAddress'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!' });
    }

    if (updates.includes('unformattedAddress')) {
        const location = await req.user.generateLocation();
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

router.delete('/me', async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// POST AVATAR
// * upload.single() is middlware provided by multer
// -> upload.single() requires an arguemnt we are just calling upload
// -> 'upload' must match key value in req.body (key value pair in postman)
router.post('/me/avatar', isLoggedIn, upload.single('avatar'), async (req, res) => {  // async for req.user.save()
    
  // * use sharp to resize photo and convert to png format
  //  -> req.file.buffer is from multer and contains binary info form the image uploaded
    const buffer = await sharp(req.file.buffer).resize({ width: 200, height: 200 }).png().toBuffer();

        req.user.avatar = buffer;
        await req.user.save();  // save file to user profile
        res.redirect('../../addQuestions');
    }, (error, req, res, next) => { // all four arguments needed so express knows to expect an error
    res.status(400).send({error: error.message }); // error from upload.single multer middleware
})

//     const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();

//     req.user.avatar = buffer;
//     await req.user.save(); // save file to user profile
//     res.send();
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
// })


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
        locations = users.map((user) => {
            // console.log("user", user)
            return {name: user.username, location: user.location, id: user._id}
            // return {user.name, user.location};
        })
        
        

        res.status(200).send(locations); 
    } catch(err) {
        console.log(err);
    }
})

router.get('/formatLocation/:location', async (req, res) => {
    try {
        const loc = await geocoder.geocode(req.params.location);

        // console.log(loc[0].formattedAddress.replace(/^[,][, ]/, ''));

        res.send({data:loc[0].formattedAddress.replace(/[,]+/g, '').trim()})

    } catch (e) {
        console.log(e);
        // res.status(500).send(e);
    }
})


module.exports = router;
