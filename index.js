const   express =           require('express'),
        cors =              require('cors'),
        path =              require('path'),
        bodyParser =        require('body-parser'),
        userRouter =        require('./src/routers/user'),
        answerRouter =      require('./src/routers/answer'),
        questionRouter =    require('./src/routers/question'),
        mainRouter =        require('./src/routers/main');

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

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'src/views'));


// Set static folder
// app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('../public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + "/public"));


app.use('/users', userRouter);
app.use('/questions', questionRouter);
app.use('/answers', answerRouter);
app.use('/', mainRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));
