const sharp = require('sharp');
const fs = require('fs').promises;

// Try to load background removal, but make it optional
let removeBackground = null;
try {
    const bgRemoval = require('@imgly/background-removal-node');
    removeBackground = bgRemoval.removeBackground;
    console.log('✅ Background removal library loaded');
} catch (error) {
    console.warn('⚠️ Background removal library not available:', error.message);
    console.warn('⚠️ Will process images without background removal');
}

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
 * Uses center crop with optional background removal
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

        let processedBuffer = imageBuffer;

        // Try to remove background if library is available
        if (removeBackground) {
            try {
                console.log('🔄 Removing background...');
                processedBuffer = await removeBackground(imageBuffer);
                console.log('✅ Background removed');
            } catch (bgError) {
                console.warn('⚠️ Background removal failed, continuing without it:', bgError.message);
                // Continue with original image
            }
        } else {
            console.log('⚠️ Skipping background removal (library not available)');
        }

        // Process image: crop and resize to passport standards
        // Standard passport photo: 35mm x 45mm at 600 DPI = 827 x 1063 pixels
        const passportImage = await sharp(processedBuffer)
            .extract(cropArea)
            .resize(827, 1063, {
                fit: 'cover',
                position: 'center'
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background
            .jpeg({ quality: 95 })
            .toBuffer();

        console.log('✅ Passport photo generated successfully');

        // Clean up uploaded file
        await fs.unlink(imagePath);

        return passportImage;
    } catch (error) {
        console.error('❌ Passport processing error:', error);
        console.error('Error stack:', error.stack);

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
