const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
    toolName: {
        type: String,
        required: true
    },
    errorMessage: {
        type: String,
        required: true
    },
    stackTrace: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
errorLogSchema.index({ timestamp: -1 });
errorLogSchema.index({ toolName: 1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;
