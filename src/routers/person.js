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

module.exports = router;
