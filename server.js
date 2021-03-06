require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const routes = require('./routes/routes');

const app = express();

// Connect Database
connectDB();

const sess = {
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  sess.cookie.secure = true; //serve secure cookies, requires https
  sess.cookie.httpOnly = true;
  sess.store = new MongoStore({ mongooseConnection: mongoose.connection });
}

app.use(session(sess));

// Init middleware
app.use(express.json({ extended: false }));

// Routes
app.use('/', routes);

app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message
      });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
