// * Importing all the required modules and middlewares * //
const express = require('express');
const morgan = require('morgan');
const session = require('express-session');


const cors = require('cors');
//const bodyParser = require('body-parser');




require('dotenv').config();

const middlewares = require('../lib/error');
const api = require('../api/routes');
const passport = require('../lib/authentication').passport;




const app = express();


app.use(morgan('dev'));

//app.use(bodyParser.json({extended: true}))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(
    {
      origin: true,
      credentials: true
    }
))
//app.use(bodyParser.urlencoded({extended: true}))


app.use(express.json());
app.get('/', cors() ,(req, res) => {
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
  secret: process.env.SECRET_KEY,
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

const authRoutes = require('../api/routes/auth');
const storeRoutes = require('../api/routes/store');
const indexRoutes = require('../api/routes/index');
const dashboardRoutes = require('../api/routes/dashboard');
const reservationRoutes = require('../api/routes/reservations');

const { scheduleReservationExpirationTask } = require('../lib/tasks');
scheduleReservationExpirationTask();




app.use('/auth', authRoutes);
app.use('/store', storeRoutes);
app.use('/index', indexRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reservations', reservationRoutes);



app.use('/api/routes', api);

/* Importing error handling middlewares */
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
app.use(middlewares.defaultErr);



module.exports = app;
