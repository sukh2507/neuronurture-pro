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
    // IMPROVED: More flexible screening structure
    screening: {
      memoryMatch: {
        finalScore: Number,
        totalMoves: Number,
        pairsFound: Number,
        timeUsed: Number,
        completedAt: { type: Date, default: Date.now },
        mentalCheck: {
          type: String,
          default: 'dyslexia'
        }
      },
      wordAdventure: {
        totalScore: Number,
        accuracy: Number,
        correctPatternsFound: Number,
        timeUsed: Number,
        completedAt: { type: Date, default: Date.now },
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
        completedAt: { type: Date, default: Date.now },
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
        completedAt: { type: Date, default: Date.now },
        mentalCheck: {
          type: String,
          default: 'dyscalculia'
        }
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
  childProfileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Add completedAt timestamp when screening data is updated
    if (this.isModified('screening')) {
      const screening = this.screening;
      Object.keys(screening).forEach(gameType => {
        if (screening[gameType] && !screening[gameType].completedAt) {
          screening[gameType].completedAt = new Date();
        }
      });
    }
    
    next();
  });

  module.exports = mongoose.model('ChildProfile', childProfileSchema);