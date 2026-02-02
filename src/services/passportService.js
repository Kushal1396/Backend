const sharp = require('sharp');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs').promises;

/**
 * Calculate center crop area for passport photo
 * This uses a simple center crop approach instead of face detection
 */
function calculateCenterCrop(imageWidth, imageHeight) {
    // Passport photo aspect ratio (35mm x 45mm = 0.778)
    const targetAspectRatio = 35 / 45;

    let cropWidth, cropHeight;

    // Determine crop dimensions based on image orientation
    if (imageWidth / imageHeight > targetAspectRatio) {
        // Image is wider than passport ratio
        cropHeight = imageHeight;
        cropWidth = Math.floor(cropHeight * targetAspectRatio);
    } else {
        // Image is taller than passport ratio
        cropWidth = imageWidth;
        cropHeight = Math.floor(cropWidth / targetAspectRatio);
    }

    // Center the crop
    const left = Math.floor((imageWidth - cropWidth) / 2);
    const top = Math.floor((imageHeight - cropHeight) / 2);

    return {
        left: Math.max(0, left),
        top: Math.max(0, top),
        width: cropWidth,
        height: cropHeight
    };
}

/**
 * Generate passport photo from uploaded image
 * Uses center crop and background removal - no face detection required
 */
async function generatePassportPhoto(imagePath) {
    try {
        console.log('📸 Processing passport photo:', imagePath);

        // Read image
        const imageBuffer = await fs.readFile(imagePath);

        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        console.log(`📐 Image dimensions: ${metadata.width}x${metadata.height}`);

        // Calculate center crop area
        const cropArea = calculateCenterCrop(metadata.width, metadata.height);
        console.log('✅ Crop area calculated');

        // Remove background
        console.log('🔄 Removing background...');
        const noBgBuffer = await removeBackground(imageBuffer);

        // Process image: crop and resize to passport standards
        // Standard passport photo: 35mm x 45mm at 600 DPI = 827 x 1063 pixels
        const passportImage = await sharp(noBgBuffer)
            .extract(cropArea)
            .resize(827, 1063, {
                fit: 'cover',
                position: 'center'
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background
            .jpeg({ quality: 95 })
            .toBuffer();

        console.log('✅ Passport photo generated');

        // Clean up uploaded file
        await fs.unlink(imagePath);

        return passportImage;
    } catch (error) {
        console.error('❌ Passport processing error:', error);

        // Clean up on error
        try {
            await fs.unlink(imagePath);
        } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError.message);
        }

        throw new Error(`Failed to process passport photo: ${error.message}`);
    }
}

module.exports = {
    generatePassportPhoto
};
