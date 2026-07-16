const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

console.log('✅ AuthRoutes loaded');
console.log('✅ registerUser type:', typeof registerUser);
console.log('✅ loginUser type:', typeof loginUser);

const router = express.Router();

console.log('✅ Registering routes...');
router.post('/register', (req, res, next) => {
  console.log('➡️ Register route hit');
  console.log('➡️ registerUser is:', registerUser);
  console.log('➡️ registerUser type:', typeof registerUser);
  registerUser(req, res, next);
});

router.post('/login', (req, res, next) => {
  console.log('➡️ Login route hit');
  loginUser(req, res, next);
});

console.log('✅ Routes registered successfully');
module.exports = router;