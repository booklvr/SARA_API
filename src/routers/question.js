const   express =   require('express'),
        Answer  =   require('../models/answer'),
        Question =  require('../models/question'),
        auth    =   require('../middleware/auth');

const router = new express.Router();

// Get Logged in User's question
// * get user from auth middlware -> req.user
router.get('/me', auth, async (req, res) => {
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
router.post('/', auth, async (req, res) => {

    try {
        await req.user.populate({
            path: 'questions' // populate questions
        }).execPopulate();

        // console.log(req.user.questions)
        console.log(req.user.questions);

        if (!(req.user.questions === undefined || req.user.questions.length == 0)) {
            // throw new Error('Oh no..... woops');
            return res.status(400).send({error: 'Question set already exists'});
        }

        const question = new Question({
            ...req.body,
            owner: req.user._id,
        })

        await question.save();
        res.status(201).send(question);

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

// Update Questions
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body); // return lists of keys from req.body
    const allowedUpdates = ['question1', 'question2', 'question3', 'question4'];
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

        res.send(question);
    } catch (e) {
        console.log("e", e)
        res.status(400).send(e);
    }
})

// Delete Questions 
router.delete('/:id', auth, async (req, res) => {
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
