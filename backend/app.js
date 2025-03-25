const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const routes = require('./routes/index');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const connectDB = require('./config/database');
const moment = require('moment-timezone');
const helmet = require('helmet');
require('dotenv').config();


require('./cron/dailyQuizCron');
require('./cron/userDataCron');
require('./cron/restoreHp')
require('./cron/dailyStatistics')
const { unblockIP } = require('./middlewares/attackDetection');

// unblockIP('77.65.101.144');
// const { createDailyQuiz } = require('./cron/dailyQuizCron');
// createDailyQuiz();
// const { resetUserProgress } = require('./cron/userDataCron');
// resetUserProgress();
// const { restoreHp } = require('./cron/restoreHp');
// restoreHp();
// const { updateDailyStatistics } = require('./cron/dailyStatistics');
// updateDailyStatistics();

console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
connectDB();

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true,
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'squlio',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60,
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(flash());

const options = {
  key: fs.readFileSync('./ssl_keys/squlio.key'),
  cert: fs.readFileSync('./ssl_keys/squlio.crt'),
};

app.use(function (err, req, res, next) {
  if (err instanceof URIError) {
    console.error(err);
    res.status(400).send('Invalid URL');
  } else {
    next(err);
  }
});

app.use('/', routes);

app.set('port', process.env.PORT || 443);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

module.exports = app;

