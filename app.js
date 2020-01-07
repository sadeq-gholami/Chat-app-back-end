const express = require('express');
const app = express();
const morgan= require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const chatkitRoute = require('./api/routes/chatkitRoute');
const picturesRoute= require('./api/routes/pictures');

mongoose.connect("mongodb+srv://chat-app-database:"+ 
process.env.MONGO_ATLAS_PW +
"@chat-app-databse-tywzm.mongodb.net/test?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true 
});

app.use('/uploads',express.static('uploads'));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/chatkit', chatkitRoute);
app.use('/pictures', picturesRoute);



module.exports= app;