// * Importing all the required modules and middlewares * //
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');


const cors = require('cors');
const bodyParser = require('body-parser');




require('dotenv').config();

const middlewares = require('../lib/error');
const api = require('../api/routes');
const passport = require('../lib/authentication').passport;




const app = express();


app.use(morgan('dev'));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({}));

app.use(express.json());
app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});
app.use(session({
  secret: 'key123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Passport middleware
// Using pre-setup passport with rules defined in lib/authentication.js
app.use(passport.initialize());
app.use(passport.session());
module.exports.passport = passport; // Allow passport to be used by other routes

/* Importing all API routes */
const machineRoutes = require('../api/routes/machines');
const feedbackRoutes = require('../api/routes/feedbacks');
const authRoutes = require('../api/routes/auth');
const productRoutes = require('../api/routes/products');
const userRoutes = require('../api/routes/users');
const indexRoutes = require('../api/routes/index');

const scheduleReservationExpirationTask = require('../lib/tasks');
scheduleReservationExpirationTask();



app.use('/machines', machineRoutes);
app.use('/feedbacks', feedbackRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/index', indexRoutes);




app.use('/api/routes', api);

/* Importing error handling middlewares */
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
app.use(middlewares.defaultErr);



module.exports = app;
