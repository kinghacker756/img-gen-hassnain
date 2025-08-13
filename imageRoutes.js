const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');

const upload = multer({ storage: multer.memoryStorage() });

// Image Analysis
router.post('/image-analysis', upload.single('image'), imageController.analyzeImage);

// Image Enhancement
router.post('/image-enhancement', upload.single('image'), imageController.enhanceImage);

module.exports = router;