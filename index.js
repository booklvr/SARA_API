const   express =           require('express'),
        cors =              require('cors'),
        path =              require('path'),
        bodyParser =        require('body-parser'),
        passport =          require('passport'),
        LocalStrategy =     require('passport-local'),
        flash =             require("connect-flash"),
        userRouter =        require('./src/routers/user'),
        answerRouter =      require('./src/routers/answer'),
        questionRouter =    require('./src/routers/question'),
        mainRouter =        require('./src/routers/main'),
        User =              require('./src/models/user');

const connectDB = require('./src/db/mongoose');

// Connect to database
connectDB();

const   app = express(),
        port = process.env.PORT;

// Body parser
app.use(express.json());


//Enable cors 
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'src/views'));


// Set static folder
// app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('../public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + "/public"));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// set up flash 
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})


app.use('/users', userRouter);
app.use('/questions', questionRouter);
app.use('/answers', answerRouter);
app.use('/', mainRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));
