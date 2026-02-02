const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/image/change-background
 * @desc    Change or remove image background
 * @access  Public
 * @body    backgroundColor (optional) - hex color like #FFFFFF
 */
router.post(
    '/change-background',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    imageController.changeBackground
);

/**
 * @route   POST /api/image/resize
 * @desc    Resize image to custom dimensions
 * @access  Public
 * @body    width, height, maintainAspectRatio (optional)
 */
router.post(
    '/resize',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    imageController.resizeImage
);

/**
 * @route   POST /api/image/compress
 * @desc    Compress image with quality control
 * @access  Public
 * @body    quality (1-100, default 80)
 */
router.post(
    '/compress',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    imageController.compressImage
);

/**
 * @route   POST /api/image/convert
 * @desc    Convert image format
 * @access  Public
 * @body    format (jpeg, png, webp)
 */
router.post(
    '/convert',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    imageController.convertFormat
);

module.exports = router;
