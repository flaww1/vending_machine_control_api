// generate user authentication library

// Importing dependencies
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { User_type } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importing Greenly libraries
const {
  getUserByNumber,
  getUserByEmail,
  createUser
} = require('./persistence');
const { errorHandler } = require('./error');

// Setting up passport

passport.serializeUser(function (user, done) {
  done(null, user.number);
});

passport.deserializeUser(function (number, done) {
  getUserByNumber(number)
    .then((user) => {
      done(null, user);
    });
});

/* Defining login LocalStrategy (email + password), used to create new JWT tokens */

passport.use('basic-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (email, password, done) { // Callback
    // Check if user exists
    getUserByEmail(email, true)
      .then((user) => {
        // If user not found, return error
        if (!user) {
          return done(null, false, {
            message: 'User with specified e-mail not found.'
          });
        } else { // If user found, check password
          if (!bcrypt.compareSync(password, user.password.value)) {
            return done(null, false, {
              message: 'Wrong credentials for specified user.'
            });
          } else { // If password is correct, return user
            return done(null, user);
          }
        }
      });
  }));

/* Defining JWT validation strategy, used to check if JWT tokens are valid. Does NOT authenticate, only validates token. */
passport.use(
  new JWTstrategy({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    },
    async (req, token, done) => {
      try {
        if (token) {

          // Allow ID to proceed into authentication checking middleware
          return done(null, token.user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

/* Easy-to-call validation function, calls JWT strategy and returns user object to request context */
const check = function (req, res, next) {
  passport.authenticate('jwt', {
    session: false
  }, async (err, tokenUser, info) => {
    if (err || !tokenUser) {
      // Handling any possible errors
      return res.status(401)
        .json({ message: 'Invalid token. Unauthorized access.' });
    }

    // If everything is alright, retrieve the user
    try {
      await getUserByNumber(tokenUser.number)
        .then((retrievedUser) => {
          if (retrievedUser) {
            req.user = retrievedUser;
            return next();
          } else {
            return res.status(401)
              .json({ message: 'Invalid token. Unauthorized access.' });
          }
        });
    } catch (e) {
      console.log(e);
      return res.status(500)
        .send(errorHandler());
    }
  })(req, res, next);
};

module.exports = {
  passport,
  check
};
