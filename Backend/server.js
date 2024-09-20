const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/reviewDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Mongoose schema
const reviewSchema = new mongoose.Schema({
    rating: Number,
    reviewText: String,
    photo: String, // Store photo filename
    date: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// POST route to submit a review
app.post('/reviews', upload.single('photo'), async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const photo = req.file ? req.file.filename : null;

        const newReview = new Review({
            rating,
            reviewText,
            photo,
        });

        await newReview.save();
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting review', error });
    }
});

// GET route to fetch reviews
app.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ date: -1 });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
