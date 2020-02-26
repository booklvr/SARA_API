const   express = require('express'),
        auth    = require('../middleware/auth'),
        User    = require('../models/user'),
        multer  = require('multer'), // required for file uploads
        sharp   = require('sharp'); // convert and resize images

const router = new express.Router();

router.get('/', (req, res) => {
    res.send('hello');
})

module.exports = router;
