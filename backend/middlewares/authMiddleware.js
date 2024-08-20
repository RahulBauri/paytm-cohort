const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(403).json({ message: 'auth header not provided' });
    throw new Error();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      return res.status(403).json({ message: 'invalid token' });
    }
  } catch (error) {
    res.status(403).json({ message: 'invalid token' });
    throw new Error();
  }
};

module.exports = authMiddleware;
