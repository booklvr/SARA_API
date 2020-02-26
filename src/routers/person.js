const   express = require('express'),
        Person  = require('../models/person');

const router = new express.Router();


router.get('/', async (req, res) => {
    try {
        const persons = await Person.find({});

        console.log(persons);

        persons ? res.send(persons) : res.status(404).send();
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/', async (req, res) => {
    const person = new Person({
        ...req.body, // spread operator copies everythinng from req.body
        // owner: req.user._id //
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
