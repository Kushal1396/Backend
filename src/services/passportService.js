const sharp = require('sharp');
const { FaceDetector, FilesetResolver } = require('@mediapipe/tasks-vision');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs').promises;
const path = require('path');

let faceDetector = null;

/**
 * Initialize MediaPipe Face Detector
 */
async function initializeFaceDetector() {
    if (faceDetector) return faceDetector;

    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                delegate: "CPU"
            },
            runningMode: "IMAGE"
        });

        console.log('✅ Face Detector initialized');
        return faceDetector;
    } catch (error) {
        console.error('❌ Face Detector initialization failed:', error.message);
        throw error;
    }
}

/**
 * Detect face in image and get bounding box
 */
async function detectFace(imageBuffer) {
    try {
        const detector = await initializeFaceDetector();

        // Convert buffer to image data that MediaPipe can process
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        const { data, info } = await image
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Create ImageData-like object
        const imageData = {
            data: new Uint8ClampedArray(data),
            width: info.width,
            height: info.height
        };

        // Detect faces
        const detections = detector.detect(imageData);

        if (!detections.detections || detections.detections.length === 0) {
            throw new Error('No face detected in the image');
        }

        // Get the first (most confident) face detection
        const face = detections.detections[0];
        const bbox = face.boundingBox;

        return {
            x: Math.max(0, Math.floor(bbox.originX)),
            y: Math.max(0, Math.floor(bbox.originY)),
            width: Math.floor(bbox.width),
            height: Math.floor(bbox.height),
            imageWidth: metadata.width,
            imageHeight: metadata.height
        };
    } catch (error) {
        console.error('Face detection error:', error.message);
        throw error;
    }
}

/**
 * Calculate crop area for passport photo (centered on face with proper margins)
 */
function calculatePassportCrop(faceBox, imageWidth, imageHeight) {
    const { x, y, width, height } = faceBox;

    // Passport photo aspect ratio (3:4 approximately)
    const targetAspectRatio = 35 / 45; // width/height for passport

    // Add margins around face (30% on each side for passport standards)
    const marginFactor = 1.8;
    const faceWidth = width * marginFactor;
    const faceHeight = faceWidth / targetAspectRatio;

    // Center the crop on the face
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    let cropX = Math.max(0, Math.floor(centerX - faceWidth / 2));
    let cropY = Math.max(0, Math.floor(centerY - faceHeight / 2));
    let cropWidth = Math.min(Math.floor(faceWidth), imageWidth - cropX);
    let cropHeight = Math.min(Math.floor(faceHeight), imageHeight - cropY);

    return {
        left: cropX,
        top: cropY,
        width: cropWidth,
        height: cropHeight
    };
}

/**
 * Generate passport photo from uploaded image
 */
async function generatePassportPhoto(imagePath) {
    try {
        console.log('📸 Processing passport photo:', imagePath);

        // Read image
        const imageBuffer = await fs.readFile(imagePath);

        // Detect face
        const faceBox = await detectFace(imageBuffer);
        console.log('✅ Face detected');

        // Calculate crop area
        const cropArea = calculatePassportCrop(
            faceBox,
            faceBox.imageWidth,
            faceBox.imageHeight
        );

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
        // Clean up on error
        try {
            await fs.unlink(imagePath);
        } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError.message);
        }
        throw error;
    }
}

module.exports = {
    generatePassportPhoto,
    initializeFaceDetector
};
