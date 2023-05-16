const express = require('express');
const morgan = require('morgan');

const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api/routes');
const machineRoutes = require('./api/routes/machines');
const feedbackRoutes = require('./api/routes/feedbacks');

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

app.use('/machines', machineRoutes);
app.use('/feedbacks', feedbackRoutes);

app.use('/api/routes', api);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
