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

// GET ADD QUESTION FORM
router.get('/', isLoggedIn, (req, res) => {
    data = {
        title: 'Add Questions',
        h1: 'Add Your Four Questions',
        url: '/users/me',
        item1: 'Question One?',
        item2: 'Question Two?',
        item3: 'Question Three',
        item4: 'Question Four',
    }
    res.render("pages/formFull", { data });
})

// POST QUESTIONS FORM
router.post('/', isLoggedIn, async (req, res) => {

    const questionExists = await Question.findOne({owner: req.user._id});

    // console.log(questionExists);

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

// read all questions from all users  !!! remove later not only for development
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

// GET CONFIRM UPDATE FORM
router.get('/confirmUpdate', isLoggedIn, async (req, res) => {

    const data = {
        title: "Confirm Upate",
        url: "/questions/confirmUpdate",
        id: "update",
        message: "Are you sure you want to update your questions.",
        message2: "If you change an questions, all the answers to that question will be removed and cannot be recovered.  Are you sure you want to proceed.",
    }
    res.render('pages/formConfirm', { data });
})

// POST CONFIRM UPDATE
router.post('/confirmUpdate', isLoggedIn, async (req, res) => {

    req.body.update === "update" ? res.redirect('./update') : res.redirect('../users/me');

});

// GET UPDATE FORM
router.get('/update', isLoggedIn, async (req, res) => {
    try {
        const question = await Question.findOne({owner: req.user._id});
        
        data = {
            review: true,
            title: 'Update Questions',
            h1: 'Update Your Questions',
            url: '/questions/update',
            item1: 'Question One?',
            item2: 'Question Two?',
            item3: 'Question Three',
            item4: 'Question Four',
            value1: question.item1,
            value2: question.item2,
            value3: question.item3,
            value4: question.item4
        }
        // console.log(data);

        res.render("pages/formFull", { data })

    } catch (err) {
        req.flash('error', 'Sorry! Questions not found');
        console.log(err)
        res.status(404).send(err);
    }  
})


// POST UPDATE QUESTION FORM
router.post('/update/', isLoggedIn, async (req, res) => {
    const updates = Object.keys(req.body); // return lists of keys from req.body
    const allowedUpdates = ['item1', 'item2', 'item3', 'item4'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'});
    }

    try {
        const question = await Question.findOne({owner: req.user._id});

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

// GET CONFIRM DELETE FORM
router.get('/confirmDelete', isLoggedIn, async (req, res) => {

    const data = {
        title: "Confirm Delete",
        url: "/questions/confirmDelete",
        input1: "delete",
        input2: "cancel",
        name: "delete",
        message: "Are you sure you want to delete your questions.",
        message2: "If you delete your questions, all the answers to your questions will be removed and cannot be recovered.?"
    }

    res.render('pages/formConfirm', { data });
})


// POST CONFIRM UPDATE
router.post('/confirmDelete', isLoggedIn, async (req, res) => {

    req.body.update === "delete" ? res.redirect('./delete') : res.redirect('../users/me');

});

// Delete Questions 
router.get('/delete', isLoggedIn, async (req, res) => {
    try {
        const deleteQuestions = await Question.findOneAndDelete({owner: req.user._id});

        if (deleteQuestions) {
            req.flash('success', 'Questions deleted successfully');
            res.redirect('../../users/me');
        } else {
            res.status(404).send();
        };
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
