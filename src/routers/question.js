const   express =       require('express'),
        Answer =        require('../models/answer'),
        Question =      require('../models/question'),
        {isLoggedIn} =  require('../middleware/auth');

const router = new express.Router();

// Get Logged in User's question
// * get user from auth middlware -> req.user
router.get('/me', isLoggedIn, async (req, res) => {
    try {
        // console.log(req.user);

        await req.user.populate({
            path: 'questions' // populate questions
        }).execPopulate();

        
        res.send(req.user.questions);
    } catch (e) {
        res.status(500).send(e);
    }
})

// Add a set of Questions
router.post('/', isLoggedIn, async (req, res) => {

    const questionExists = await Question.findOne({owner: req.user._id});

    console.log(questionExists);

    try {
        const question = new Question({
            ...req.body,
            owner: req.user._id,
        })

        await question.save();

        res.redirect(`../profile/${req.user._id}`)
        // res.status(201).send(question);

    } catch (e) {
        console.log("e", e)
        
        res.status(500).send(e);
    }
});

// read all questions from all users
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();

        if (questions === undefined || questions == 0) {
            return res.status(404).send({error: 'No questions found'});
        }

        res.status(200).send(questions);
    } catch(e) {
        console.log(e);
        res.status(404).send(e)
    }
});

router.get('/update', isLoggedIn, async (req, res) => {
    try {
        const question = await Question.findOne({owner: req.user._id});
        
        res.render("pages/updateQuestions", { question })

    } catch (err) {
        req.flash('error', 'Sorry! Questions not found');
        console.log(err)
        res.status(404).send(err);
    }
    
})

// Update Questions
router.post('/update/:id', isLoggedIn, async (req, res) => {
    const updates = Object.keys(req.body); // return lists of keys from req.body
    const allowedUpdates = ['item1', 'item2', 'item3', 'item4'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'});
    }

    try {
        const question = await Question.findOne({ _id: req.params.id, owner: req.user._id});

        if(!question) {
            return res.status(404).send({error: 'Answer not found'})
        } 

        updates.forEach(update => question[update] = req.body[update]);
        
        await question.save();
        req.flash('success', 'Questions updated successfully');
        res.redirect('../../users/me');
    } catch (e) {
        console.log("e", e)
        req.flash('error', 'Questions could not be updated because of a problem.')
        res.status(400).send(e);
    }
})

// Delete Questions 
router.delete('/:id', isLoggedIn, async (req, res) => {
    try {
        const deleteQuestions = await Question.findOneAndDelete({ _id: req.params.id, owner: req.user._id});

        deleteQuestions ? res.send(deleteQuestions) : res.status(404).send();
    } catch(e) {
        console.log("e", e);
        res.status(500).send
        
    }
})

// Get all answers to the question
router.get('/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
        await question.populate({
            path: 'answers'
        }).execPopulate();
        

        // console.log(question.answers)

        res.send(question.answers);
    } catch (e) {
        console.log('e:', e);
        res.status(500).send(e);
    }
})


module.exports = router;
