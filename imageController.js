const tf = require('@tensorflow/tfjs-node');
const cv = require('opencv4nodejs');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Load TensorFlow model (assuming you have a pre-trained model)
let model;
async function loadModel() {
  model = await tf.loadGraphModel('file://path/to/your/model.json');
}

// Initialize model on startup
loadModel().catch(console.error);

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load image
    const imageBuffer = req.file.buffer;
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Preprocess image for model
    const tensor = tf.browser.fromPixels(canvas)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();
    
    // Make prediction
    const predictions = await model.predict(tensor).data();
    
    // Process results (example for object detection)
    const results = {
      objects: [],
      scene: '',
      confidence: Math.max(...predictions) * 100
    };
    
    // Add your specific result processing logic here
    
    res.json(results);
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
};

exports.enhanceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Load image with OpenCV
    const imageBuffer = req.file.buffer;
    let img = cv.imdecode(imageBuffer);
    
    // Apply enhancement
    // 1. Denoising
    let denoised = new cv.Mat();
    cv.fastNlMeansDenoisingColored(img, denoised, 10, 10, 7, 21);
    
    // 2. Contrast enhancement
    let lab = new cv.Mat();
    cv.cvtColor(denoised, lab, cv.COLOR_BGR2Lab);
    
    let labPlanes = new cv.MatVector();
    cv.split(lab, labPlanes);
    
    let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(labPlanes.get(0), labPlanes.get(0));
    
    cv.merge(labPlanes, lab);
    cv.cvtColor(lab, denoised, cv.COLOR_Lab2BGR);
    
    // Convert back to buffer
    const enhancedImage = cv.imencode('.jpg', denoised).toString('base64');
    
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(enhancedImage, 'base64'));
  } catch (error) {
    console.error('Image enhancement error:', error);
    res.status(500).json({ error: 'Image enhancement failed' });
  }
};