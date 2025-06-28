const express = require('express');
const router = express.Router();
const MotherProfile = require('../models/MotherProfile');
const authenticateToken = require('../middleware/auth');

// Utility function
const calculateMoodStats = (moodData) => {
  const numberOfMoodTracking = moodData.length;
  const sum = moodData.reduce((acc, val) => acc + val, 0);
  const averageMood = numberOfMoodTracking > 0 ? sum / numberOfMoodTracking : 0;
  const happyDays = moodData.filter(m => m >= 4).length;

  return { averageMood, numberOfMoodTracking, happyDays };
};

// POST /api/mood/submit
router.post('/submit', authenticateToken, async (req, res) => {
  console.log('🔔 POST /api/mood/submit hit');

  try {
    const { mood, notes } = req.body;
    const userId = req.user._id;

    console.log('📌 Extracted Data:', { mood, notes });

    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({
        error: 'Invalid mood value. Must be between 1 and 5.'
      });
    }

    let motherProfile = await MotherProfile.findOne({ userId });

    if (!motherProfile) {
      return res.status(404).json({
        error: 'Mother profile not found. Please create a profile first.'
      });
    }

    if (!motherProfile.moodTracking) {
      motherProfile.moodTracking = {
        moodData: [],
        moodNotes: [],
        moodLogs: [],
        averageMood: 0,
        numberOfMoodTracking: 0,
        happyDays: 0
      };
    }

    motherProfile.moodTracking.moodData.push(mood);
    motherProfile.moodTracking.moodNotes.push(notes || '');
    motherProfile.moodTracking.moodLogs.push({
      date: new Date(),
      mood,
      notes: notes || ''
    });

    const stats = calculateMoodStats(motherProfile.moodTracking.moodData);
    motherProfile.moodTracking.averageMood = stats.averageMood;
    motherProfile.moodTracking.numberOfMoodTracking = stats.numberOfMoodTracking;
    motherProfile.moodTracking.happyDays = stats.happyDays;

    await motherProfile.save();

    res.status(200).json({
      message: 'Mood data saved successfully',
      moodTracking: motherProfile.moodTracking
    });

  } catch (error) {
    console.error('🔥 Error saving mood data:', error);
    res.status(500).json({
      error: 'Internal server error while saving mood data'
    });
  }
});

// GET /api/mood/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const motherProfile = await MotherProfile.findOne({ userId });

    if (!motherProfile) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    const moodTracking = motherProfile.moodTracking || {
      moodData: [],
      moodNotes: [],
      moodLogs: [],
      averageMood: 0,
      numberOfMoodTracking: 0,
      happyDays: 0
    };

    res.status(200).json({ moodTracking });

  } catch (error) {
    console.error('Error fetching mood history:', error);
    res.status(500).json({
      error: 'Internal server error while fetching mood history'
    });
  }
});

// GET /api/mood/stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const motherProfile = await MotherProfile.findOne({ userId });

    if (!motherProfile || !motherProfile.moodTracking) {
      return res.status(200).json({
        averageMood: 0,
        numberOfMoodTracking: 0,
        happyDays: 0,
        recentMoods: []
      });
    }

    const { moodTracking } = motherProfile;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMoods = moodTracking.moodLogs
      .filter(log => new Date(log.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      averageMood: moodTracking.averageMood,
      numberOfMoodTracking: moodTracking.numberOfMoodTracking,
      happyDays: moodTracking.happyDays,
      recentMoods
    });

  } catch (error) {
    console.error('Error fetching mood stats:', error);
    res.status(500).json({
      error: 'Internal server error while fetching mood statistics'
    });
  }
});

// DELETE /api/mood/reset
router.delete('/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const motherProfile = await MotherProfile.findOne({ userId });

    if (!motherProfile) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    motherProfile.moodTracking = {
      moodData: [],
      moodNotes: [],
      moodLogs: [],
      averageMood: 0,
      numberOfMoodTracking: 0,
      happyDays: 0
    };

    await motherProfile.save();

    res.status(200).json({
      message: 'Mood tracking data reset successfully'
    });

  } catch (error) {
    console.error('Error resetting mood data:', error);
    res.status(500).json({
      error: 'Internal server error while resetting mood data'
    });
  }
});

module.exports = router;
