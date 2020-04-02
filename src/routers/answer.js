const   express =       require('express'),
        Answer  =       require('../models/answer'),
        Question =      require('../models/question'),
        {isLoggedIn } = require('../middleware/auth');

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
router.get('/', isLoggedIn, async (req, res) => {

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



// ADD ANSWER
router.post('/:id', isLoggedIn, async (req, res) => {

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
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
    
    
    // const answer = await Answer.find({owner: req.user._id, questionID: req.params.id});
    // if (answer) {
    //     console.log('Answer already exists');
    //     res.send('you already answered this');
    // }

    // answer = new Answer({
    //     ...req.body, 
    //     owner: req.user._id,
    //     questionID: req.params.id
    // })

    // try {
    //     await answer.save();
    // } catch(e) {
    //     console.log(e);
    //     res.status(500).send(e);
    // }

    try {
        const question = await Question.findById(req.params.id);
        res.redirect(`../profile/${question.owner}`);
    } catch (e) {
        console.log('cant get question', e);
        res.status(401).send(e);
    }
    


    // console.log(answer);

    // try {
    //     await answer.save();

    //     const question = Question.findById(answer.questionID);
    //     // console.log(question);
    //     const author = question.owner;
    //     console.log(author);
    //     res.redirect(`../profile/${author}`);
        // res.status(201).send();
//     } catch (e) {
//         console.log(e);
//         res.status(400).send(e);
//     }
});

// UPDATE PERSON
// * check if update property in req.body is allowed
// * get user from auth middleware --> req.user
// * find answer using answer id --> req.params.id
//                          --> req.user._id
router.patch('/:id', isLoggedIn, async (req, res) => {
    const updates = Object.keys(req.body); // returns list of keys form req.body
    const allowedUpdates = ['name', 'city', 'food', 'job', 'skill', 'dinner', 'extras'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const answer = await Answer.findOne({ _id: req.params.id, owner: req.user._id });

        if (!answer) {
            return res.status(404).send({error: 'Answer not found'});
        }

        updates.forEach(update => answer[update] = req.body[update]);

        await answer.save();
        res.send(answer);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// DELETE Answer
router.delete('/:id', isLoggedIn, async (req, res) => {

    try {
        const deleteAnswer = await Answer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        deleteAnswer ? res.send(deleteAnswer) : res.status(404).send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});


module.exports = router;
