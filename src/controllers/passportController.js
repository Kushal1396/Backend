const passportService = require('../services/passportService');
const ErrorLog = require('../models/errorLog.model');

/**
 * Generate passport photo from uploaded image
 */
exports.generatePassportPhoto = async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const imagePath = req.file.path;

        // Generate passport photo
        const passportPhotoBuffer = await passportService.generatePassportPhoto(imagePath);

        // Send image as response
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', 'attachment; filename="passport-photo.jpg"');
        res.send(passportPhotoBuffer);

    } catch (error) {
        console.error('Passport photo generation error:', error.message);

        // Log error to database
        try {
            await ErrorLog.create({
                endpoint: '/api/passport/process',
                method: 'POST',
                errorMessage: error.message,
                stackTrace: error.stack,
                userIP: req.ip,
                userAgent: req.get('user-agent')
            });
        } catch (logError) {
            console.error('Error logging failed:', logError.message);
        }

        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate passport photo'
        });
    }
};
