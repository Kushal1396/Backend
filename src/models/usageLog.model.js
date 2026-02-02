const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
    toolName: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    processingTime: {
        type: Number,
        required: true
    },
    ipAddress: {
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
usageLogSchema.index({ timestamp: -1 });
usageLogSchema.index({ toolName: 1 });

const ToolUsageLog = mongoose.model('ToolUsageLog', usageLogSchema);

module.exports = ToolUsageLog;
