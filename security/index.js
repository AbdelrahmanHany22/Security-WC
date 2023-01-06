const express = require('express');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();
const { default: mongoose } = require('mongoose');

//security dependencies
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');


const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const apiRoutes = require('./controllers/securityHandlers.js');

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// limiting api calls to avoid DDOS
const limiter = rateLimit({
    max: 100,
    windowMS: 60 * 60 * 1000,
    message: 'Too many requests from this IP.'
});
app.use(limiter);

apiRoutes(app);
//undefined routes handling
app.all('*', (req,res,next)=>{
    next(new AppError(`the url ${req.originalUrl} doesnt exist`,404));
});


const port = 5008;
const server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const uri = process.env.DATABASE_STRING;

mongoose.connect(uri)

const connection = mongoose.connection;

connection.once('open',() => {
    console.log('mongodb database connection successful')
})

const getClientIp = function(req) {
    var ipAddress = req.connection.remoteAddress;
    if (!ipAddress) {
        return '';
    }// convert from "::ffff:192.0.0.1"  to "192.0.0.1"
    if (ipAddress.substr(0, 7) == "::ffff:") {
        ipAddress = ipAddress.substr(7)
    }return ipAddress;
};

app.use(async (req, res, next) => {
    if(_wafjs.reqCheck(req.method, req.headers['content-type']))
      res.status(403).send()
  });