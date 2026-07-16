const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('✅ Auth middleware loaded');

const protect = async (req, res, next) => {
  console.log('🛡️ Protect middleware called');
  console.log('🛡️ Headers:', req.headers);
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('🛡️ Token found:', token.substring(0, 20) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('🛡️ Token decoded:', decoded);
      
      req.user = await User.findById(decoded.id).select('-password');
      console.log('🛡️ User found:', req.user?._id);
      
      console.log('🛡️ Calling next()...');
      next();
    } catch (error) {
      console.log('❌ Auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    console.log('❌ No token found');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

console.log('✅ Protect middleware exported');
module.exports = { protect };