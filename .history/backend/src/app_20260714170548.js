const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

console.log('🚀 App starting...');

dotenv.config();
console.log('✅ Environment loaded');

connectDB();
console.log('✅ Database connection initiated');

const app = express();

console.log('✅ Setting up middleware...');
app.use(cors());
console.log('✅ CORS enabled');

app.use(express.json());
console.log('✅ JSON parser enabled');

console.log('✅ Loading auth routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('✅ Auth routes loaded');

console.log('✅ Loading task routes...');
app.use('/api/tasks', require('./routes/taskRoutes'));
console.log('✅ Task routes loaded');

app.get('/', (req, res) => {
  console.log('🏠 Home route hit');
  res.send('MERN API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('🎉 App is ready!');
});