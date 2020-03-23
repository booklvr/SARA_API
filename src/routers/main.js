const   express =   require('express'),
        User =      require('../models/user'),
        Question =  require('../models/question'),
        Answer =    require('../models/answer'),
        auth =      require('../middleware/auth');
        
const router = new express.Router();

router.get('/', (req, res) => {
    res.render("pages/landing");
});

router.get('/register', (req, res) => {
    res.render("pages/register");
});

// need 
router.get('/profile/:id', async (req, res) => {
    
    try {
        const user = await User.findById(req.params.id);

        await user.populate({
            path: 'questions' // populate questions
        }).execPopulate();

        

        console.log(user.questions[0]._id);

        const questions = await Question.findById(user.questions[0]._id);

        console.log(questions);

        await questions.populate({
            path: 'answers'
        }).execPopulate();

        console.log(questions.answers)

        res.render('pages/profile', {currentUser: user, questions, cards: questions.answers})

        
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

        const cards = [];

        await Promise.all(questions.map(async (question) => {
            
            // console.log(question);
            const card = {};
            card.item1 = question.item1;
            card.item2 = question.item2;
            card.item3 = question.item3;
            card.item4 = question.item4;
            card._id = question._id;
            card.owner= question.owner;

            const user = await User.findById(question.owner);
            card.location = user.location.formattedAddress;
            card.name = user.name;

            cards.push(card);
        }))

        // console.log(cards);
        
        // res.status(200).send(questions);
        
        res.status(200).render("pages/questions", {cards});
    } catch(e) {
        console.log(e);
        res.status(404).send(e)
    }
})

router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();

        if (questions === undefined || questions == 0) {
            return res.status(404).send({error: 'No questions found'});
        }

        // res.status(200).send(questions);
        res.render("pages/questions", {cards: questions});
    } catch(e) {
        console.log(e);
        res.status(404).send(e)
    }
});



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