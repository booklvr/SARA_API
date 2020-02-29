const   express = require('express'),
        Person  = require('../models/person'),
        auth    = require('../middleware/auth');

const router = new express.Router();


// READ all persons from logged in User
// * /persons?limit=10&skip=10
//  --> limit search by ten and skp first 10
// * persons? sortBy=createdAt:desc
//  --> sort by creatAt by descending order

// * get user from auth middleware -> req.user
// * populate persons from logged in user --> req.user.populate();
//      --> get from UserSchema.virtual
// * send populated person
router.get('/', auth, async (req, res) => {

    const match = {};
    const sort = {}; // empty object to parse sort query

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':') // split by chosen special character :
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; // sort first part = asc or desc
    }

    try {
        await req.user.populate({
            path: 'persons', // populate persons
            options: {
                limit: parseInt(req.query.limit), // limit persons read by ? limit=""
                skip: parseInt(req.query.skip), // skip number of persons
                sort // es6 shorthand sort: sort
            }
        }).execPopulate();

        res.send(req.user.persons);
    } catch (e) {
        res.stauts(500).send(e);
    }

});

// ADD PERSON
router.post('/', auth, async (req, res) => {
    const person = new Person({
        ...req.body, // spread operator copies everythinng from req.body
        owner: req.user._id //
    });

    try {
        await person.save();
        res.status(201).send(person);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// UPDATE PERSON
// * check if update property in req.body is allowed
// * get user from auth middleware --> req.user
// * find person using person id --> req.params.id
//                          --> req.user._id
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body); // returns list of keys form req.body
    const allowedUpdates = ['name', 'city', 'food', 'job', 'skill', 'dinner', 'extras'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try {
        const person = await Person.findOne({ _id: req.params.id, owner: req.user._id });

        if (!person) {
            return res.status(404).send({error: 'Person not found'});
        }

        updates.forEach(update => person[update] = req.body[update]);

        await person.save();
        res.send(person);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

// DELETE PERSON
router.delete('/:id', auth, async (req, res) => {

    try {
        const deletePerson = await Person.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        deletePerson ? res.send(deletePerson) : res.status(404).send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
});


module.exports = router;
