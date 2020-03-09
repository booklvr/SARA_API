const   express =       require('express'),
        cors =          require('cors'),
        userRouter =    require('./routers/user'),
        taskRouter =    require('./routers/person');

const connectDB = require('./db/mongoose');

// Connect to database
connectDB();


const   app = express(),
        port = process.env.PORT;

// Body parser
app.use(express.json());


//Enable cors 
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/persons', taskRouter);
app.use('/users', userRouter);
app.use('/map', mapRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));
