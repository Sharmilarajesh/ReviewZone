const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");


const Product = require("./models/Product");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const reviewRoutes = require("./routes/reviews");

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  "https://reviewzone-frontend.onrender.com",
  "https://reviewzone-backend.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        process.env.NODE_ENV !== "production" &&
        /^https?:\/\/localhost(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    }
    next();
  });
}

const seedInitialProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const seedProducts = [
        {
          name: "Laptop",
          price: 45000,
          description: "15-inch screen, 8GB RAM, 512GB SSD, Windows 11",
          image: "/images/seeds/laptop.jpg",
        },
        {
          name: "Smartphone",
          price: 15000,
          description: "6.5-inch display, 128GB storage, 48MP camera",
          image: "/images/seeds/smartphone.jpg",
        },
        {
          name: "Mouse",
          price: 499,
          description: "USB receiver, silent clicks, black color",
          image: "/images/seeds/mouse.jpg",
        },
        {
          name: "Keyboard",
          price: 799,
          description: "Wired USB keyboard, full-size, multimedia keys",
          image: "/images/seeds/keyboard.jpg",
        },
        {
          name: "Headphones",
          price: 1299,
          description: "Over-ear, wired, comfortable padding",
          image: "/images/seeds/headphones.jpg",
        },
        {
          name: "Smart Watch",
          price: 2499,
          description: "Fitness tracker, heart rate monitor",
          image: "/images/seeds/smartwatch.jpg",
        },
        {
          name: "Tablet",
          price: 12999,
          description: "10-inch display, 64GB storage, WiFi",
          image: "/images/seeds/tablet.jpg",
        },
        {
          name: "Power Bank",
          price: 999,
          description: "20000mAh, dual USB ports, fast charging",
          image: "/images/seeds/powerbank.jpg",
        },
        {
          name: "USB Flash Drive",
          price: 399,
          description: "64GB, USB 3.0, plug and play",
          image: "/images/seeds/flashdrive.jpg",
        },
        {
          name: "Bluetooth Speaker",
          price: 1499,
          description: "Portable, 10-hour battery, waterproof",
          image: "/images/seeds/speaker.jpg",
        },
      ];
      await Product.insertMany(seedProducts);
    }
  } catch (error) {
    console.log("Error seeding products:", error);
  }
};

setTimeout(() => {
  seedInitialProducts();
}, 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
