const User = require('../models/User');
const jwt = require('jsonwebtoken');

console.log('✅ AuthController loaded');
const crypto = require('crypto');

const generateToken = (id) => {
  console.log('🔄 Generating token for user:', id);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  console.log('📝 Register function called');
  console.log('📝 Request body:', req.body);
  
  try {
    const { name, email, password } = req.body;
    console.log('📝 Checking if user exists:', email);
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    console.log('✅ Creating new user:', email);
    const user = await User.create({ name, email, password });
    
    console.log('✅ User created successfully:', user._id);
    const token = generateToken(user._id);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token
    });
    console.log('✅ Response sent successfully');
  } catch (error) {
    console.log('❌ Error in register:', error.message);
    console.log('❌ Full error:', error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  console.log('🔐 Login function called');
  console.log('🔐 Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    console.log('🔐 Finding user:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ User found, checking password');
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password matched, generating token');
    const token = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token
    });
    console.log('✅ Login response sent');
  } catch (error) {
    console.log('❌ Error in login:', error.message);
    res.status(500).json({ message: error.message });
  }
};

console.log('✅ AuthController exports ready');
module.exports = { registerUser, loginUser };