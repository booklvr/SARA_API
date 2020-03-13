const   express =   require('express'),
        Answer  =   require('../models/answer'),
        Question =  require('../models/question'),
        auth    =   require('../middleware/auth');

const router = new express.Router();


module.exports = router;
