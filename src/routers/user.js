const   express = require('express'),
        auth    = require('../middleware/auth'),
        User    = require('../models/user'),
        multer  = require('multer'), // required for file uploads
        sharp   = require('sharp'); // convert and resize images

const router = new express.Router();

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

module.exports = router;
