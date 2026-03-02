const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');
require('dotenv').config();

connectDB();

const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin created successfully!');
      console.log('Email: admin@gmail.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin already exists');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.log('Error:', error);
  }
};

createAdmin();