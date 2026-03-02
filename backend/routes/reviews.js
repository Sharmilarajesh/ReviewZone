const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const { uploadReview } = require("../middleware/upload");

router.get("/product/:productId", async (req, res) => {
  try {
    let reviews = await Review.find({ productId: req.params.productId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    reviews = reviews.map((r) => {
      const obj = r.toObject();
      if (obj.image && !obj.image.startsWith("http")) {
        obj.image = `${baseUrl}${obj.image}`;
      }
      return obj;
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, uploadReview.single("image"), async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    const newReview = new Review({
      productId,
      userId: req.user.id,
      rating: parseInt(rating),
      comment,
      image: req.file ? `/uploads/reviews/${req.file.filename}` : "",
    });

    await newReview.save();

    const allReviews = await Review.find({ productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      avgRating,
      totalReviews: allReviews.length,
    });

    await newReview.populate("userId", "name email");
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, uploadReview.single("image"), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    if (req.file) {
      review.image = `/uploads/reviews/${req.file.filename}`;
    }

    await review.save();

    const allReviews = await Review.find({ productId: review.productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / allReviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      avgRating,
      totalReviews: allReviews.length,
    });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = review.productId;
    await review.deleteOne();

    const remainingReviews = await Review.find({ productId });

    if (remainingReviews.length > 0) {
      const totalRating = remainingReviews.reduce(
        (sum, r) => sum + r.rating,
        0,
      );
      const avgRating = totalRating / remainingReviews.length;
      await Product.findByIdAndUpdate(productId, {
        avgRating,
        totalReviews: remainingReviews.length,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        avgRating: 0,
        totalReviews: 0,
      });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-reviews", auth, async (req, res) => {
  try {
    let reviews = await Review.find({ userId: req.user.id })
      .populate("productId", "name price image")
      .sort({ createdAt: -1 });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    reviews = reviews.map((r) => {
      const obj = r.toObject();
      if (obj.image && !obj.image.startsWith("http")) {
        obj.image = `${baseUrl}${obj.image}`;
      }
      return obj;
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
