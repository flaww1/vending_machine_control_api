// Checking authorization
  function isAdmin(req, res, next) {
    const userType = req.user.type; // Assuming the role is stored in the req.user object

    if (userType === "ADMINISTRATOR") {
      next(); // User is an admin, proceed to the next middleware/route handler
    } else {
      res.status(403).json({ error: 'Access denied' }); // User is not an admin, return access denied error
    }
  }

  function isUser(req, res, next) {
    const userType = req.user.type; // Assuming the role is stored in the req.user object

    if (userType === 'USER') {
      next(); // User is an admin, proceed to the next middleware/route handler
    } else {
      res.status(403).json({ error: 'Access denied' }); // User is not an admin, return access denied error
    }
  }

  function isUserOrAdmin(req, res, next) {
    const userType = req.user.type; // Assuming the role is stored in the req.user object

    if (userType === 'USER' || userType === 'ADMINISTATOR') {
      next(); // User is an admin, proceed to the next middleware/route handler
    } else {
      res.status(403).json({ error: 'Access denied' }); // User is not an admin, return access denied error
    }
  }

  function isProvider(req, res, next) {
    const userType = req.user.type; // Assuming the role is stored in the req.user object

    if (userType === 'PROVIDER') {
      next(); // User is an admin, proceed to the next middleware/route handler
    } else {
      res.status(403).json({ error: 'Access denied' }); // User is not an admin, return access denied error
    }
  }

module.exports = {
isAdmin,
isUser,
isUserOrAdmin,
isProvider

}




