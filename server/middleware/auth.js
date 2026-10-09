const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader ?.startsWith('Bearer ') ?
    authHeader.slice(7) : null;

  if (!token)
    return res.status(401).json({
      msg: 'No token. Access denied.'
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user)
      return res.status(401).json({
        msg: 'User not found.'
      });

    if (!user.isActive)
      return res.status(403).json({
        msg: 'Account suspended.'
      });

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      msg: 'Token invalid or expired.'
    });
  }
};