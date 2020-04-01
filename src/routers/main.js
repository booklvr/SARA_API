const   express =       require('express'),
        User =          require('../models/user'),
        Question =      require('../models/question'),
        Answer =        require('../models/answer'),
        { isLoggedIn }= require('../middleware/auth'),
        card =          require('../utils/cards');
        
const router = new express.Router();

router.get('/', (req, res) => {
    res.render("pages/landing");
});

router.get('/register', (req, res) => {
    res.render("pages/register");
});

router.get('/login', (req, res) => {
    res.render("pages/login");
})

router.get('/addAvatar', isLoggedIn, (req, res) => {
    res.render("pages/addAvatar");
})

router.get('/addQuestions', isLoggedIn, (req, res) => {
    res.render("pages/addQuestions");
})

// need 
router.get('/profile/:id', async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new Error("User not found");
        }

        const questions = await Question.findOne({owner: user._id});

        let answers = undefined;
        let cards = [];

        if (questions) {
            await questions.populate({
                path: 'answers' // populate answers to this question
            }).execPopulate();

            answers = questions.answers;

            cards = await card.buildCards(answers);
            
        }
        res.render('pages/profile', {currentUser: user, questions, cards})

    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

router.get('/allQuestions', async (req, res) => {

    try {
        const questions = await Question.find();

        if (questions === undefined || questions == 0) {
            return res.status(404).send({error: 'No questions found'});
        }

        // build the cards 
        const cards = await card.buildCards(questions);
        
        res.status(200).render("pages/questions", {cards});
    } catch(e) {
        console.log(e);
        res.status(404).send(e)
    }
})

// router.get('/', async (req, res) => {
//     try {
//         const questions = await Question.find();

//         if (questions === undefined || questions == 0) {
//             return res.status(404).send({error: 'No questions found'});
//         }

//         // res.status(200).send(questions);
//         res.render("pages/questions", {cards: questions});
//     } catch(e) {
//         console.log(e);
//         res.status(404).send(e)
//     }
// });



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