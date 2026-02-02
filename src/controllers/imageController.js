const imageService = require('../services/imageService');
const ErrorLog = require('../models/errorLog.model');

/**
 * Change or remove background
 */
exports.changeBackground = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const { backgroundColor } = req.body;
        const imagePath = req.file.path;

        const processedImage = await imageService.changeBackground(imagePath, backgroundColor);

        // Determine content type based on background
        const contentType = backgroundColor ? 'image/jpeg' : 'image/png';
        const extension = backgroundColor ? 'jpg' : 'png';

        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `attachment; filename="image-no-bg.${extension}"`);
        res.send(processedImage);

    } catch (error) {
        console.error('Background change error:', error.message);
        await logError('/api/image/change-background', 'POST', error, req);

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to change background'
        });
    }
};

/**
 * Resize image
 */
exports.resizeImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const { width, height, maintainAspectRatio } = req.body;

        if (!width || !height) {
            return res.status(400).json({
                status: 'error',
                message: 'Width and height are required'
            });
        }

        const imagePath = req.file.path;
        const processedImage = await imageService.resizeImage(
            imagePath,
            parseInt(width),
            parseInt(height),
            maintainAspectRatio === 'true'
        );

        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', `attachment; filename="resized-${width}x${height}.jpg"`);
        res.send(processedImage);

    } catch (error) {
        console.error('Resize error:', error.message);
        await logError('/api/image/resize', 'POST', error, req);

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to resize image'
        });
    }
};

/**
 * Compress image
 */
exports.compressImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const { quality } = req.body;
        const imagePath = req.file.path;

        const qualityValue = quality ? parseInt(quality) : 80;

        if (qualityValue < 1 || qualityValue > 100) {
            return res.status(400).json({
                status: 'error',
                message: 'Quality must be between 1 and 100'
            });
        }

        const processedImage = await imageService.compressImage(imagePath, qualityValue);

        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', `attachment; filename="compressed-q${qualityValue}.jpg"`);
        res.send(processedImage);

    } catch (error) {
        console.error('Compression error:', error.message);
        await logError('/api/image/compress', 'POST', error, req);

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to compress image'
        });
    }
};

/**
 * Convert image format
 */
exports.convertFormat = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const { format } = req.body;

        if (!format) {
            return res.status(400).json({
                status: 'error',
                message: 'Target format is required (jpeg, png, or webp)'
            });
        }

        const imagePath = req.file.path;
        const processedImage = await imageService.convertFormat(imagePath, format);

        const mimeTypes = {
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp'
        };

        const contentType = mimeTypes[format.toLowerCase()] || 'image/jpeg';

        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `attachment; filename="converted.${format}"`);
        res.send(processedImage);

    } catch (error) {
        console.error('Format conversion error:', error.message);
        await logError('/api/image/convert', 'POST', error, req);

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to convert format'
        });
    }
};

/**
 * Helper function to log errors
 */
async function logError(endpoint, method, error, req) {
    try {
        await ErrorLog.create({
            endpoint,
            method,
            errorMessage: error.message,
            stackTrace: error.stack,
            userIP: req.ip,
            userAgent: req.get('user-agent')
        });
    } catch (logError) {
        console.error('Error logging failed:', logError.message);
    }
}
