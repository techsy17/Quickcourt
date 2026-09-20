const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcourt',
  JWT_SECRET: process.env.JWT_SECRET || 'quickcourt_jwt_secret_dev_key_2026_sports_app',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  EMAIL_USER: process.env.EMAIL_USER || 'mythoughts0018@gmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
};

module.exports = config;
