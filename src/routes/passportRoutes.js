const express = require('express');
const router = express.Router();
const passportController = require('../controllers/passportController');
const { upload, handleUploadError } = require('../middlewares/uploadMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/passport/generate
 * @desc    Generate passport photo from uploaded image
 * @access  Public
 */
router.post(
    '/generate',
    uploadLimiter,
    upload.single('image'),
    handleUploadError,
    passportController.generatePassportPhoto
);

module.exports = router;
