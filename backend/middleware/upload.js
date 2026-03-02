const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folders if they don't exist
const createFolders = () => {
  const dirs = [
    'uploads/products',
    'uploads/reviews',
    'uploads/products/seeds'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created folder: ${dir}`);
    }
  });
};
createFolders();

const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `product-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const reviewStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reviews/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `review-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
  }
};

const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const uploadReview = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

module.exports = { uploadProduct, uploadReview };