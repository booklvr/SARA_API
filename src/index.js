const   express =       require('express'),
        userRouter =    require('./routers/user'),
        taskRouter =    require('./routers/person');

const connectDB = require('./db/mongoose');

// Connect to database
connectDB();

const   app = express(),
        port = process.env.PORT;

app.use(express.json());
app.use('/persons', taskRouter);
app.use('/users', userRouter);

app.listen(port, () => console.log(`Server is up on port ${port}`));
