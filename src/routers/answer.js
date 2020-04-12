const   express =       require('express'),
        Answer  =       require('../models/answer'),
        Question =      require('../models/question'),
        {isLoggedIn, signInOrRegister } = require('../middleware/auth');

const router = new express.Router();


// READ all answers from logged in User
// * /answers?limit=10&skip=10
//  --> limit search by ten and skp first 10
// * answers? sortBy=createdAt:desc
//  --> sort by creatAt by descending order

// * get user from auth middleware -> req.user
// * populate answers from logged in user --> req.user.populate();
//      --> get from UserSchema.virtual
// * send populated answer
router.get('/', signInOrRegister, async (req, res) => {

    const match = {};
    const sort = {}; // empty object to parse sort query

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':') // split by chosen special character :
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; // sort first part = asc or desc
    }

    try {
        await req.user.populate({
            path: 'answers', // populate answers
            options: {
                limit: parseInt(req.query.limit), // limit answers read by ? limit=""
                skip: parseInt(req.query.skip), // skip number of answers
                sort // es6 shorthand sort: sort
            }
        }).execPopulate();

        res.send(req.user.answers);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Answer Question Form
router.get('/:id', signInOrRegister, async (req, res) => {
    // find question
    try {
        const question = await Question.findById(req.params.id);

        if (!question) throw "Can't find Question"

        data = {
            title: 'Update Answer',
            h1: 'Update Your Answers',
            url: `/answers/${req.params.id}`,
            item1: question.item1,
            item2: question.item2,
            item3: question.item3,
            item4: question.item4,
        }

        const answer = await Answer.findOne({questionID: req.params.id, owner: req.user._id});
        console.log("answer", answer)

        if (answer) {
            data.review = true,
            data.value1 = answer.item1;
            data.value2 = answer.item2;
            data.value3 = answer.item3;
            data.value4 = answer.item4;
        }

        console.log(data);

        res.render("pages/formFull", { data })

    } catch (err) {
        console.log(err);
        req.flash('error', 'Sorry! Something went wrong');
        res.status(500).redirect(`../../../users/me`);
    }
})


// ADD ANSWER
router.post('/:id', signInOrRegister, async (req, res) => {

    const query = {
        owner: req.user._id, 
        questionID: req.params.id
    }

    const update = {
        ...req.body,
        owner: req.user._id,
        questionID: req.params.id,
    }

    const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    }

    try {
        const answer = await Answer.findOneAndUpdate(query, update, options)
    
        if (!answer) throw "Can't add answer";

        const question = await Question.findById(answer.questionID);

        if (!question) throw "Can't find question";

        res.redirect(`../../profile/${question.owner}`);
    } catch (err) {
        console.log('cant add answer', err);
        res.status(401).send(err);
    }
    


  
});

// UPDATE PERSON
// * check if update property in req.body is allowed
// * get user from auth middleware --> req.user
// * find answer using answer id --> req.params.id
//                          --> req.user._id

router.get('/update/:id', signInOrRegister, async (req, res) => {
    
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) throw "Can't find Answer"

        const question = await Question.findById(answer.questionID);

        if (!question) throw "Can't find Question"

        data = {
            review: true,
            title: 'Update Answer',
            h1: 'Update Your Answers',
            url: `/answers/update/${req.params.id}`,
            item1: question.item1,
            item2: question.item2,
            item3: question.item3,
            item4: question.item4,
            value1: answer.item1,
            value2: answer.item2,
            value3: answer.item3,
            value4: answer.item4
        }

        res.render("pages/formFull", { data })

    } catch (err) {
        console.log(err);
        req.flash('error', 'Sorry! Something went wrong');
        res.status(500).redirect(`../../../users/me`);
    }
    
})

router.post('/update/:id', signInOrRegister, async (req, res) => {
    const updates = Object.keys(req.body); // returns list of keys form req.body
    const allowedUpdates = ['item1', 'item2', 'item3', 'item4'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const answer = await Answer.findOne({ _id: req.params.id });

        if (!answer) {
            return res.status(404).send({error: 'Answer not found'});
        }

        updates.forEach(update => answer[update] = req.body[update]);

        await answer.save();

        const question = await Question.findById(answer.questionID);
        res.redirect(`../../profile/${question.owner}`);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// DELETE Answer
router.get('/delete/:id', isLoggedIn, async (req, res) => {

    try {
        const deleteAnswer = await Answer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        deleteAnswer ? res.redirect('../../../users/me') : res.status(404).send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});


module.exports = router;
