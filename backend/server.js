const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

const seedInitialProducts = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    const seedProducts = [
      {
        name: "Laptop",
        price: 45000,
        description: "15-inch screen, 8GB RAM, 512GB SSD, Windows 11",
        image: "/uploads/products/seeds/laptop.jpg"
      },
      {
        name: "Smartphone",
        price: 15000,
        description: "6.5-inch display, 128GB storage, 48MP camera",
        image: "/uploads/products/seeds/smartphone.jpg"
      },
      {
        name: "Mouse",
        price: 499,
        description: "USB receiver, silent clicks, black color",
        image: "/uploads/products/seeds/mouse.jpg"
      },
      {
        name: "Keyboard",
        price: 799,
        description: "Wired USB keyboard, full-size, multimedia keys",
        image: "/uploads/products/seeds/keyboard.jpg"
      },
      {
        name: "Headphones",
        price: 1299,
        description: "Over-ear, wired, comfortable padding",
        image: "/uploads/products/seeds/headphones.jpg"
      },
      {
        name: "Smart Watch",
        price: 2499,
        description: "Fitness tracker, heart rate monitor",
        image: "/uploads/products/seeds/smartwatch.jpg"
      },
      {
        name: "Tablet",
        price: 12999,
        description: "10-inch display, 64GB storage, WiFi",
        image: "/uploads/products/seeds/tablet.jpg"
      },
      {
        name: "Power Bank",
        price: 999,
        description: "20000mAh, dual USB ports, fast charging",
        image: "/uploads/products/seeds/powerbank.jpg"
      },
      {
        name: "USB Flash Drive",
        price: 399,
        description: "64GB, USB 3.0, plug and play",
        image: "/uploads/products/seeds/flashdrive.jpg"
      },
      {
        name: "Bluetooth Speaker",
        price: 1499,
        description: "Portable, 10-hour battery, waterproof",
        image: "/uploads/products/seeds/speaker.jpg"
      }
    ];
    await Product.insertMany(seedProducts);
  }
};

const startServer = async () => {
  await connectDB();
  await seedInitialProducts();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('/{*path}', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});