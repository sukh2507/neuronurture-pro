const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  doctorId: {
    type: String, // Changed to String to avoid reference issues
    required: true
  },
  motherId: {
    type: String, // Changed to String to avoid reference issues
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000 // Adjust as needed
  },
  senderRole: {
    type: String,
    enum: ['doctor', 'mother'],
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
messageSchema.index({ doctorId: 1, motherId: 1, createdAt: 1 });
messageSchema.index({ seen: 1, senderRole: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;