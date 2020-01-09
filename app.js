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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });

app.use('/chatkit', chatkitRoute);
app.use('/pictures', picturesRoute);



module.exports= app;