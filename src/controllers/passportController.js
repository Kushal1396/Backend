const passportService = require('../services/passportService');
const ErrorLog = require('../models/errorLog.model');
const ToolUsageLog = require('../models/usageLog.model');

/**
 * Generate passport photo from uploaded image
 */
exports.generatePassportPhoto = async (req, res) => {
    const startTime = Date.now();

    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file uploaded'
            });
        }

        const imagePath = req.file.path;
        const fileSize = req.file.size;

        // Generate passport photo
        const passportPhotoBuffer = await passportService.generatePassportPhoto(imagePath);

        // Log successful usage
        const processingTime = Date.now() - startTime;
        try {
            await ToolUsageLog.create({
                toolName: 'passport',
                fileSize: fileSize,
                processingTime: processingTime,
                ipAddress: req.ip,
                timestamp: new Date()
            });
        } catch (logError) {
            console.error('Usage logging failed:', logError.message);
        }

        // Send image as response
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Disposition', 'attachment; filename="passport-photo.jpg"');
        res.send(passportPhotoBuffer);

    } catch (error) {
        console.error('❌ Passport processing error:', error);
        console.error('Stack trace:', error.stack);

        // Log error to database
        try {
            await ErrorLog.create({
                toolName: 'passport',
                errorMessage: error.message,
                stackTrace: error.stack,
                userAgent: req.get('user-agent'),
                timestamp: new Date()
            });
        } catch (logError) {
            console.error('Error logging failed:', logError.message);
        }

        res.status(500).json({
            status: 'error',
            error: error.message || 'Failed to generate passport photo',
            message: 'Passport photo processing failed. Please try again with a different image.'
        });
    }
};
