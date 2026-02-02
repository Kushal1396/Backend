require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

// MongoDB Connection (Optional for local development)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Connected Successfully');

      // Start server only after DB connection
      app.listen(PORT, () => {
        console.log(`🚀 FormPhotoAI Backend running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        console.log(`💾 Database: MongoDB Connected`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.log('⚠️ Starting server without database...');

      app.listen(PORT, () => {
        console.log(`🚀 FormPhotoAI Backend running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        console.log(`⚠️ Database: Not Connected (Running without MongoDB)`);
      });
    });
} else {
  console.log('⚠️ MONGODB_URI not found in environment variables');
  console.log('📦 Starting server without database...');

  app.listen(PORT, () => {
    console.log(`🚀 FormPhotoAI Backend running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: Not Connected (Running in standalone mode)`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err.message);
  console.error(err.stack);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
