const User = require ("../models/user");

const buildCards = async (items) => {
    
    const cards = [];

    await Promise.all(items.map(async (item) => {
            
        // console.log(question);
        const card = {};
        card.item1 = item.item1;
        card.item2 = item.item2;
        card.item3 = item.item3;
        card.item4 = item.item4;
        card._id = item._id;
        card.owner= item.owner;
        if (item.questionID) {
            card.questionID = item.questionID;
        }

        const user = await User.findById(item.owner);
        // console.log(user);
        card.location = user.location.formattedAddress;
        card.username = user.username;

        // console.log(card)

        cards.push(card);
    }));

    return cards
}

module.exports.buildCards = buildCards;