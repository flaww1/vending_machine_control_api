// Imports
const express   = require('express');
const router    = express.Router();
const passport  = require('../../src/app').passport;
const jwt       = require("jsonwebtoken");
const cors = require('cors');


const { loginValidator } = require('../../lib/validation');
const {
  errorHandler
} = require('../../lib/error');
const authentication = require('../../lib/authentication');

router.all('*', cors({origin: '*'}));

/* Returns JWT token to use if everything goes well, returns error messages otherwise. */
router.post('/login', loginValidator(), async (req, res, next) => {
  passport.authenticate('basic-login', async (err, user, info) => {
    try {
      if (err) {
        // Handling any possible errors
        return res.status(500).send(errorHandler())
      }
      if (!user) {
        // If the authentication goes wrong
        return res.status(401).send(info)
      }
      req.login(user, {
        session: false
      }, async (error) => {
        if (error) {
          // Handling any possible errors
          return res.status(500).send(errorHandler())
        }
        // If everything goes well, generate the new JWT token and send it.
        const body = {
          number: user.number,
          email: user.email
        };
        const token = jwt.sign({
            user: body
          }, process.env.JWT_SECRET,
          // Signing options
          {
            expiresIn: process.env.JWT_EXPIRATION
          });

        return res.json({
          token: token,
          number: user.number
        });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.get('/status', authentication.check, async (req, res) => {
  if (req.user) {
    res.status(200).send({
      message: "Valid token. User logged in.",
      number: req.user.number
    })
  }
})

module.exports = router;
