const   express =   require('express'),
        User =      require('../models/user'),
        auth =      require('../middleware/auth');
        
const router = new express.Router();

router.get('/',  (req, res) => {
    res.render("pages/landing", {currentUser: req.user});
})


router.get('/map', (req, res) => {
    res.render("pages/map", {currentUser: undefined})
})



module.exports = router;