const   express = require('express'),
        person  = require('../models/person');

const router = new express.Router();


router.get('/', (req, res) => {
    res.send('hello');
})

module.exports = router;
