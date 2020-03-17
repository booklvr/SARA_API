const   express =   require('express'),
        User =      require('../models/user'),
        auth =      require('../middleware/auth');
        
const router = new express.Router();

router.get('/', (req, res) => {
    res.render("pages/landing");
})

// Get Locations
// router.get('/locations', async (req, res) => {
//     try {
//         const users = await User.find({});

//         if (!users) {
//             throw new Error("No users");
//         }

//         // const location = [];
//         users.forEach((user) => {
//             // console.log("user", user)
//             console.log(Object.keys(user));
//         })
        

        

//         res.status(200).send(users); 
//     } catch(err) {
//         console.log(err);
//     }
// })

router.get('/map', (req, res) => {
    res.render("pages/map", {currentUser: undefined})
})

module.exports = router;