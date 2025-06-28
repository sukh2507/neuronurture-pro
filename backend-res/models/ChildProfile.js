const mongoose = require('mongoose');

const childProfileSchema = new mongoose.Schema({
  motherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motherName: {
    type: String,
    required: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  healthHistory: [{
    condition: String,
    diagnosedAt: Date,
    notes: String
  }],
  learningConcerns: [{
    concern: String,
    identifiedAt: Date,
    notes: String
  }],
screening: {
  memoryMatch: {
    finalScore: Number,
    totalMoves: Number,
    pairsFound: Number,
    timeUsed: Number,
    mentalCheck: {
      type: String,
      default: 'dyslexia' // optional, can set from frontend
    }
  },
  wordAdventure: {
    totalScore: Number,
    accuracy: Number,
    correctPatternsFound: Number,
    timeUsed: Number,
    mentalCheck: {
      type: String,
      default: 'adhd'
    }
  },
  colorPattern: {
    totalScore: Number,
    roundsCompleted: Number,
    bestStreak: Number,
    timeUsed: Number,
    mentalCheck: {
      type: String,
      default: 'dysgraphia'
    }
  },
  shapeSequence: {
    totalScore: Number,
    levelsCompleted: Number,
    correctAnswers: Number,
    timeUsed: Number,
    mentalCheck: {
      type: String,
      default: 'dyscalculia'
    }
  }
}

,
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
childProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChildProfile', childProfileSchema);