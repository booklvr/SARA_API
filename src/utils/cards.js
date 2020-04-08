const User = require ("../models/user");

const buildCards = async (questions) => {
    
    const cards = [];

    await Promise.all(questions.map(async (question) => {
            
        // console.log(question);
        const card = {};
        card.item1 = question.item1;
        card.item2 = question.item2;
        card.item3 = question.item3;
        card.item4 = question.item4;
        card._id = question._id;
        card.owner= question.owner;

        const user = await User.findById(question.owner);
        console.log(user);
        card.location = user.location.formattedAddress;
        card.username = user.username;

        cards.push(card);
    }));

    return cards
}

module.exports.buildCards = buildCards;