const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/pdf/image-to-pdf
 * @desc    Convert one or more images to PDF
 * @access  Public
 * @body    pageSize (optional) - A4, LETTER, LEGAL, A3, A5 (default: A4)
 */
router.post(
    '/image-to-pdf',
    uploadLimiter,
    upload.array('images', 10), // Allow up to 10 images
    handleUploadError,
    pdfController.imageToPDF
);

module.exports = router;
