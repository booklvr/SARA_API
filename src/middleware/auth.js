const   jwt =   require('jsonwebtoken'),
        User =  require('../models/user');

// authorization middleware using jwt token for toures
// * all routes except post(/users/) and post(/users/login);

const auth = async (req, res, next) => {
    try {
        // req.header returns auth token plus bearer
        // * remove bearer
        const token = req.header('authorization').replace('Bearer ', '');

        // compare auth token with
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user with correct id that has authentication token still stored in their tokens array
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if(!user) {
            throw new Error();
        }

        // provide token so session knows which token to logout
        req.token = token;

        //provide next route with user so that they dont' have to search again
        // * route should use req.user, not User.findById(id)
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate'});
    }
};

module.exports = auth;
