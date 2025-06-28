// models/Consultation.js (Enhanced)
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'MotherProfile', // ✅ MUST match exactly
  required: true
},
  doctorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorProfile',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'responded', 'cancelled', 'completed'],
    default: 'pending'
  },
  urgency: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isApproved: {
    type: Boolean,
    default: null
  },
  preferredTime: {
    type: Date,
    default: null
  },
  doctorResponse: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  responseTime: {
    type: Number, // Time in minutes to respond
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  respondedAt: {
    type: Date
  },
  completedAt: {
    type: Date
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

// Pre-save middleware to calculate response time
consultationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'responded' && !this.respondedAt) {
    this.respondedAt = new Date();
    if (this.createdAt) {
      this.responseTime = Math.floor((this.respondedAt - this.createdAt) / (1000 * 60)); // in minutes
    }
  }
  
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
consultationSchema.index({ userId: 1, createdAt: -1 });
consultationSchema.index({ doctorProfileId: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ urgency: 1 });
consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ userId: 1, doctorProfileId: 1, status: 1 });

// Virtual for consultation age in hours
consultationSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60));
});

// Instance method to check if consultation is overdue
consultationSchema.methods.isOverdue = function() {
  if (this.status !== 'pending') return false;
  
  const hoursAge = this.ageInHours;
  switch (this.urgency) {
    case 'urgent':
      return hoursAge > 1;
    case 'high':
      return hoursAge > 4;
    case 'normal':
      return hoursAge > 24;
    case 'low':
      return hoursAge > 72;
    default:
      return hoursAge > 24;
  }
};

// Static method to get consultation statistics
consultationSchema.statics.getStats = async function(doctorProfileId) {
  const stats = await this.aggregate([
    { $match: { doctorProfileId: mongoose.Types.ObjectId(doctorProfileId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        responded: {
          $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : {
    total: 0,
    pending: 0,
    responded: 0,
    completed: 0,
    avgRating: 0,
    avgResponseTime: 0
  };
};

module.exports = mongoose.model('Consultation', consultationSchema);    