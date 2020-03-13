const   express =           require('express'),
        cors =              require('cors'),
        path =              require('path'),
        userRouter =        require('./routers/user'),
        answerRouter =      require('./routers/answer'),
        questionRouter =    require('./routers/question'),
        mainRouter =        require('./routers/main');

const connectDB = require('./db/mongoose');

// Connect to database
connectDB();

const   app = express(),
        port = process.env.PORT;

// Body parser
app.use(express.json());


//Enable cors 
app.use(cors());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, './views'));


// Set static folder
app.use(express.static(path.join(__dirname, '../public')));
// app.use('/public', express.static('public'));


app.use('/users', userRouter);
app.use('./questions', questionRouter);
app.use('/answers', answerRouter);
app.use('/', mainRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));
