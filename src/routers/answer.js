const   express = require('express'),
        Answer  = require('../models/answer'),
        auth    = require('../middleware/auth');

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
router.get('/', auth, async (req, res) => {

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

// ADD QUSESTION
router.post('/', auth, async (req, res) => {
    const answer = new Answer({
        ...req.body, // spread operator copies everythinng from req.body
        owner: req.user._id //
    });

    try {
        await answer.save();
        res.status(201).send(answer);
    } catch (e) {
        res.status(400).send(e);
    }
});

// UPDATE QUESTION
// * check if update property in req.body is allowed
// * get user from auth middleware --> req.user
// * find answer using answer id --> req.params.id
//                          --> req.user._id
router.patch('/:id', auth, async (req, res) => {
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
router.delete('/:id', auth, async (req, res) => {

    try {
        const deleteAnswer = await Answer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        deleteAnswer ? res.send(deleteAnswer) : res.status(404).send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});


module.exports = router;
