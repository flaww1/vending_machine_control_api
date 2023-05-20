/* Parameter Validation Package */
const { body, param, query, validationResult, matchedData } = require('express-validator');
const { checkUserConflict, getUserByID, getAllCategories, getUserByuserId} = require('./persistence');
const bcrypt = require('bcrypt');



/* User Validation Functions */

/** Checks if the user with the specified userId exists. */
function createUserValidator() {
  return[
    body('first_name')
        .notEmpty()
        .isString(),
    body('last_name')
        .notEmpty()
        .isString(),
    body('email')
        .isEmail()
        .toLowerCase()
        .custom(value => {
          return checkUserConflict("email", value).then(conflict => {
            if (conflict) {
              return Promise.reject("E-mail already in use.")
            }
          })
        }),
    body('password')
        .isLength({min: 5}),
    body('type')
        .isIn(["ADMINISTRATOR", "USER"]),


    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If any error is related to conflict, status code should be 409, not 422
        if (Object.values(errors.array()).some(x => x.msg.includes("in use"))) {
          res.statusCode = 409
        } else {
          res.statusCode = 422
        }
        return res.json({errors: errors.array()});
      }
      next();
    },

  ]
}


function updateUserValidator() {
  return [
    param('userId').isInt().toInt().custom(value => {
      return getUserByuserId(value).then(user => {
        if (!user) {
          return Promise.reject(`User with userId ${value} doesn't exist.`)
        }
      })
    }),

    body('first_name')
        .optional()
        .isString(),

    body('last_name')
        .optional()
        .notEmpty(),

    body('email')
        .isEmail()
        .optional()
        .toLowerCase()
        .custom(value => {
          return checkUserConflict("email", value).then(conflict => {
            if (conflict) {
              return Promise.reject("E-mail already in use.")
            }
          })
        }),

    body('old_password') // Require new_password if old_password is included.
        .if(body("new_password").exists()).notEmpty().withMessage("new_password and old_password both have to be included.")
        .custom( (old_password, { req }) => {
          return user = getUserByuserId(req.params.userId, true).then((user) => {

            return true;
          })
        })
        .custom( (old_password, { req }) => {
          // Check if old_password matches current user password using bcrypt.compareSync
          return user = getUserByuserId(req.params.userId, true).then((user) => {
            if (!bcrypt.compareSync(old_password, user.password.value)) {
              return Promise.reject("old_password doesn't match user password.")
            }
            return true
          })
        }),

    body('new_password') // Require old_password if new_password is included.
        .if(body("old_password").exists()).notEmpty().withMessage("new_password and old_password both have to be included.")
        .isLength({min: 5})
        .withMessage("Minimum password length is 5.").bail()
        .custom((new_password, {req}) => {
          if (req.body.old_password == new_password) {
            return Promise.reject("old_password can't be the same as new_password")
          } else {
            return true
          }
        }),
    body('type')
        .optional()
        .isIn(["ADMINISTRATOR", "USER"]),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
          // Besides server error, this would only fail for conclict reasons, therefore status code 409
        return res.status(409).json({errors: errors.array()});
      next();
    },

  ]
}

function getProductsValidator() {
  return [
    query("sort")
        .optional()
        .isIn(["newest", "oldest", "price_asc", "price_desc", "name_asc", "name_desc"]),
    query("limit")
        .optional()
        .isInt({min: 0, max: 250})
        .toInt(),
    query("page")
        .optional()
        .isInt({min:1})
        .toInt(),
    query("type")
        .optional()
        .isInt()
        .toInt(),
    query("keywords.*")
        .optional()
        .notEmpty()
        .isString(),
    query("min_price")
        .optional()
        .isFloat({min: 0})
        .toFloat()
        .notEmpty()
        .custom((value, {req}) => {
          if (req.query.max_price) {
            return value < req.query.max_price
          }
          return true;
        })
        .withMessage("Minimum price has to be lower than maximum price.").bail(),
    query("max_price")
        .optional()
        .isFloat({min: 0})
        .toFloat()
        .notEmpty()
        .custom((value, {req}) => {
          if (req.query.min_price) {
            return value > req.query.min_price
          }
          return true;
        })
        .withMessage("Maximum price has to be higher than minimum price.").bail(),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
      next();
    },
  ]
}

function getAllMachinesValidator() {
  return [
    query("sort")
        .optional()
        .isIn(["newest", "oldest", "location_asc", "location_desc"]),

    query("type")
        .optional()
        .isIn(["COLD_DRINKS", "HEATED_DRINKS", "SNACKS", "OTHERS"]),
    query("location")
        .optional()
        .isString(),

    query("status")
        .optional()
        .notEmpty()
        .isString(),

    query("keywords.*")
        .optional()
        .notEmpty()
        .isString(),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
      next();
    },
  ]
}



function loginValidator() {
  return [
    body("email")
        .notEmpty()
        .isEmail()
        .withMessage("A valid e-mail is required for login."),
    body("password")
        .notEmpty()
        .withMessage("Password is required for login."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
      next();
    },
  ]
}

function passwordResetValidator() {
  return [
    body("email")
        .notEmpty()
        .isEmail()
        .withMessage("A valid e-mail is required for password reset."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
      next();
    },
  ]
}
function verifyEmailValidator() {
  return [
    body("email")
        .notEmpty()
        .withMessage("A valid e-mail is required for verification."),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
      next();
    },
  ]
}


// Function to validate a reservation
async function reservationValidator(reservationId) {
  try {
    // Retrieve the reservation from the database
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { vendingMachine: true },
    });

    // Check if the reservation exists
    if (!reservation) {
      return {
        success: false,
        message: 'Invalid reservation ID',
      };
    }

    // Check if the reservation is already validated
    if (reservation.validated) {
      return {
        success: false,
        message: 'Reservation already validated',
      };
    }

    // Perform additional validation checks if needed
    // ...

    // Update the reservation as validated
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { validated: true },
    });

    // Return the success response
    return {
      success: true,
      message: 'Reservation validated successfully',
      reservation: updatedReservation,
    };
  } catch (error) {
    console.error('Error validating reservation:', error);
    return {
      success: false,
      message: 'An error occurred while validating the reservation',
    };
  }
}




module.exports = {
  createUserValidator,
  updateUserValidator,
  getProductsValidator,
  passwordResetValidator,
  getAllMachinesValidator,


  loginValidator,
  verifyEmailValidator,

  reservationValidator,



}
