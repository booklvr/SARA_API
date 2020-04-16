const   express =       require('express'),
        Answer =        require('../models/answer'),
        Question =      require('../models/question'),
        {signInOrRegister} =  require('../middleware/auth');

const router = new express.Router();

// Get Logged in User's question
// * get user from auth middlware -> req.user
router.get('/me', signInOrRegister, async (req, res) => {
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
router.get('/', signInOrRegister, (req, res) => {
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
router.post('/', signInOrRegister, async (req, res) => {

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
router.get('/allQuestions', async (req, res) => {
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
router.get('/confirmUpdate', signInOrRegister, async (req, res) => {

    const questions = await Question.findOne({owner: req.user._id});

    if(!questions) {
        // go to add question form page
        return res.redirect('../questions');
    }

    const data = {
        title: "Confirm Upate",
        url: "/questions/confirmUpdate",
        input1: "update",
        input2: "cancel",
        name: "update",
        message: "Are you sure you want to update your questions.",
        message2: "If you change an questions, all the answers to that question will be removed and cannot be recovered.  Are you sure you want to proceed.",
    }
    res.render('pages/formConfirm', { data });
})

// POST CONFIRM UPDATE
router.post('/confirmUpdate', signInOrRegister, async (req, res) => {

    req.body.update === "update" ? res.redirect('./update') : res.redirect('../users/me');

});

// GET UPDATE FORM
router.get('/update', signInOrRegister, async (req, res) => {

    try {
        const questions = await Question.findOne({owner: req.user._id});

        data = {
            review: true,
            title: 'Update Questions',
            h1: 'Update Your Questions',
            url: '/questions/update',
            item1: 'Question One?',
            item2: 'Question Two?',
            item3: 'Question Three',
            item4: 'Question Four',
            value1: questions.item1,
            value2: questions.item2,
            value3: questions.item3,
            value4: questions.item4
        }
        
        res.render("pages/formFull", { data })

    } catch (err) {
        req.flash('error', 'Sorry! Questions not found');
        console.log(err)
        res.status(404).send(err);
    }  
})


// POST UPDATE QUESTION FORM
router.post('/update/', signInOrRegister, async (req, res) => {
    // get Keys and validate allowed updates
    const updates = Object.keys(req.body); // return lists of keys from req.body
    console.log("updates", updates)
    
    const allowedUpdates = ['item1', 'item2', 'item3', 'item4'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'});
    }

   
        
    
    
    

    try {
        // find question
        const question = await Question.findOne({owner: req.user._id});
        console.log("question", question)
        

        // if not question question found redirect to landing page
        if(!question) {
            console.log('NO QUESTION FOUND')
            return res.status(404).redirect('../');
        } 

        // check if values are changed 
        const valuesToChange = updates.filter(update => question[update] !== req.body[update]);
        console.log("valuesToChange", valuesToChange)

        // find all answers to the question
        const answers = await Answer.find({questionID: question._id});

        if (answers.length <= 0) {
            console.log('No Answers Found')
            return res.status(404).redirect('../');
        }

        console.log(answers);
        
        // remove answers to updated questions
        answers.forEach( async (answer) => {
            valuesToChange.forEach(update => {
                answer[update] = 'removed';
            })
            await answer.save();
        })

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
router.get('/confirmDelete', signInOrRegister, async (req, res) => {

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
router.post('/confirmDelete', signInOrRegister, async (req, res) => {

    req.body.delete === "delete" ? res.redirect('./delete') : res.redirect('../users/me');

});

// Delete Questions 
router.get('/delete', signInOrRegister, async (req, res) => {
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
