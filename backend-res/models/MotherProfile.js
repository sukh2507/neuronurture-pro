const mongoose = require('mongoose');

const motherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 16,
    max: 60
  },
  pregnancyStage: {
    type: String,
    enum: ['pregnant', 'postpartum', 'none'],
    default: 'none'
  },
  pregnancyWeeks: {
    type: Number,
    min: 0,
    max: 42,
    default: 0
  },
  dueDate: {
    type: Date,
    default: null
  },
  familySupport: {
    type: String,
    enum: ['excellent', 'good', 'moderate', 'poor'],
    default: 'good'
  },
  previousMentalHealthHistory: {
    type: String,
    default: ''
  },
  currentMentalHealthConcerns: [{
    type: String
  }],
  currentChildren: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChildProfile'
  }],
  // Mood tracking field
  moodTracking: {
    moodData: [{
      type: Number,
      min: 1,
      max: 5
    }],
    moodNotes: [{
      type: String,
      default: ''
    }],
    moodLogs: [{
      date: {
        type: Date,
        default: Date.now
      },
      mood: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      notes: {
        type: String,
        default: ''
      }
    }],
    averageMood: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numberOfMoodTracking: {
      type: Number,
      default: 0,
      min: 0
    },
    happyDays: {
      type: Number,
      default: 0,
      min: 0
    }
  },
    messages: {
    type: {
      mother: [{
        message: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }],
      ai: [{
        message: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }]
    },
    default: {
      mother: [],
      ai: []
    }
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

// Update timestamp on save
motherProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MotherProfile', motherProfileSchema);