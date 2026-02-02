const express = require('express');
const router = express.Router();
const documentPhotoController = require('../controllers/documentPhotoController');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/document/generate
 * @desc    Generate all document photo formats from uploaded image
 * @access  Public
 */
router.post(
    '/generate',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    documentPhotoController.generateAllFormats
);

/**
 * @route   POST /api/document/generate/:format
 * @desc    Generate specific document photo format
 * @access  Public
 * @params  format - one of: passport, resume, linkedin, square, formUpload, signature
 */
router.post(
    '/generate/:format',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    documentPhotoController.generateSpecificFormat
);

module.exports = router;
