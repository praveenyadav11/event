// Usage: router.get('/route', auth, roleCheck('admin'), handler)
// Usage: router.get('/route', auth, roleCheck('admin', 'organizer'), handler)

module.exports = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      msg: `Access denied. Required role: ${roles.join(' or ')}`
    });
  }
  next();
};