const jwt = require('jsonwebtoken');
const Usermodel = require('../models/User');

const protectRoute = async (req, res, next) => {
  // Ensure req.cookies is defined (cookie-parser must be used in app.js/server.js)
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Usermodel.findById(decoded.userId);
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - User Not Found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { protectRoute };
