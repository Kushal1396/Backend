const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
    endpoint: {
        type: String,
        required: true
    },
    method: {
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
    userIP: {
        type: String
    },
    userAgent: {
        type: String
    },
    requestBody: {
        type: mongoose.Schema.Types.Mixed
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
errorLogSchema.index({ endpoint: 1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;
