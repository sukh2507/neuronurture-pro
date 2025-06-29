const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MotherProfile = require('../models/MotherProfile');
const authenticateToken = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Mother choice route (protected route)
router.post('/choice', authenticateToken, async (req, res) => {
  try {
    const { choice } = req.body;

    // Validation
    if (!choice) {
      return res.status(400).json({ error: 'Choice is required' });
    }

    if (!['wellbeing', 'child-screening'].includes(choice)) {
      return res.status(400).json({ error: 'Invalid choice. Must be either "wellbeing" or "child-screening"' });
    }

    // Ensure only mothers can make this choice
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can make this choice' });
    }

    // Update user to remove needsChoice flag and store their preference
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        needsChoice: false,
        lastChoice: choice,
        lastChoiceAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Choice recorded successfully',
      choice: choice,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        needsChoice: updatedUser.needsChoice,
        lastChoice: updatedUser.lastChoice,
        lastChoiceAt: updatedUser.lastChoiceAt,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Mother choice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mother profile by user ID (FIXED - no duplicate routes)
router.get('/by-user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  console.log('Fetching mother profile for userId:', userId);
  
  try {
    const mother = await MotherProfile.findOne({ userId });
    console.log('Found mother profile:', mother ? 'Yes' : 'No');

    if (!mother) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    res.json(mother);
  } catch (err) {
    console.error('Error fetching mother profile by userId:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's choice history (protected route)
router.get('/choice', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can access this
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can access this endpoint' });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      needsChoice: user.needsChoice,
      lastChoice: user.lastChoice || null,
      lastChoiceAt: user.lastChoiceAt || null
    });

  } catch (error) {
    console.error('Get choice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or Update Mother Profile (POST for create, PUT for update functionality)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can create/update mother profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can create mother profiles' });
    }

    const {
      fullName,
      age,
      pregnancyStage,
      pregnancyWeeks,
      dueDate,
      familySupport,
      previousMentalHealthHistory,
      currentMentalHealthConcerns
    } = req.body;

    // Validation
    if (!fullName || !age) {
      return res.status(400).json({ error: 'Full name and age are required' });
    }

    if (age < 16 || age > 60) {
      return res.status(400).json({ error: 'Age must be between 16 and 60' });
    }

    if (pregnancyStage && !['pregnant', 'postpartum', 'none'].includes(pregnancyStage)) {
      return res.status(400).json({ error: 'Invalid pregnancy stage' });
    }

    if (pregnancyStage === 'pregnant' && pregnancyWeeks && (pregnancyWeeks < 0 || pregnancyWeeks > 42)) {
      return res.status(400).json({ error: 'Pregnancy weeks must be between 0 and 42' });
    }

    // Prepare profile data
    const profileData = {
      userId: req.user._id,
      fullName,
      age,
      pregnancyStage: pregnancyStage || 'none',
      pregnancyWeeks: pregnancyWeeks || 0,
      familySupport: familySupport || 'good',
      previousMentalHealthHistory: previousMentalHealthHistory || '',
      currentMentalHealthConcerns: currentMentalHealthConcerns || []
    };

    // Only add dueDate if pregnancyStage is pregnant and dueDate is provided
    if (pregnancyStage === 'pregnant' && dueDate) {
      profileData.dueDate = new Date(dueDate);
    }

    // Try to find existing profile and update, or create new one
    let motherProfile = await MotherProfile.findOne({ userId: req.user._id });

    if (motherProfile) {
      // Update existing profile
      Object.assign(motherProfile, profileData);
      await motherProfile.save();
    } else {
      // Create new profile
      motherProfile = new MotherProfile(profileData);
      await motherProfile.save();
    }

    res.json({
      message: 'Mother profile saved successfully',
      profile: motherProfile
    });

  } catch (error) {
    console.error('Mother profile creation/update error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Profile already exists for this user' });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: validationErrors });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Mother Profile (authenticated user's own profile)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can access mother profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can access mother profiles' });
    }

    const motherProfile = await MotherProfile.findOne({ userId: req.user._id });

    if (!motherProfile) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    res.json(motherProfile);

  } catch (error) {
    console.error('Get mother profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mother profile by ID (used by doctors) - FIXED route
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const profileId = req.params.id;
    console.log('Fetching mother profile by ID:', profileId);

    const motherProfile = await MotherProfile.findById(profileId)
      .select('fullName age pregnancyStage pregnancyWeeks dueDate familySupport previousMentalHealthHistory currentMentalHealthConcerns currentChildren moodTracking createdAt updatedAt');

    if (!motherProfile) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    res.status(200).json(motherProfile);
  } catch (error) {
    console.error('Error fetching mother profile by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET total number of children across all mothers
router.get('/children-count', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only admin can access this endpoint.' });
    }

    const motherProfiles = await MotherProfile.find({}, 'currentChildren');

    let totalChildren = 0;
    for (const profile of motherProfiles) {
      totalChildren += profile.currentChildren?.length || 0;
    }

    res.status(200).json({ totalChildren });

  } catch (error) {
    console.error('Error fetching total children count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Mother Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can update mother profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can update mother profiles' });
    }

    const {
      fullName,
      age,
      pregnancyStage,
      pregnancyWeeks,
      dueDate,
      familySupport,
      previousMentalHealthHistory,
      currentMentalHealthConcerns
    } = req.body;

    const motherProfile = await MotherProfile.findOne({ userId: req.user._id });

    if (!motherProfile) {
      return res.status(404).json({ error: 'Mother profile not found' });
    }

    // Update fields if provided
    if (fullName !== undefined) motherProfile.fullName = fullName;
    if (age !== undefined) motherProfile.age = age;
    if (pregnancyStage !== undefined) motherProfile.pregnancyStage = pregnancyStage;
    if (pregnancyWeeks !== undefined) motherProfile.pregnancyWeeks = pregnancyWeeks;
    if (dueDate !== undefined) motherProfile.dueDate = dueDate ? new Date(dueDate) : null;
    if (familySupport !== undefined) motherProfile.familySupport = familySupport;
    if (previousMentalHealthHistory !== undefined) motherProfile.previousMentalHealthHistory = previousMentalHealthHistory;
    if (currentMentalHealthConcerns !== undefined) motherProfile.currentMentalHealthConcerns = currentMentalHealthConcerns;

    await motherProfile.save();

    res.json({
      message: 'Mother profile updated successfully',
      profile: motherProfile
    });

  } catch (error) {
    console.error('Mother profile update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: validationErrors });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get All Children for a Mother
router.get('/children', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can access their children
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can access children profiles' });
    }

    const ChildProfile = require('../models/ChildProfile');
    const children = await ChildProfile.find({ motherId: req.user._id }).sort({ createdAt: -1 });

    res.json(children);

  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate report for mother
router.post('/generate-report/:id', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Fetch mother profile data
    const motherProfile = await MotherProfile.findById(patientId);
    
    if (!motherProfile) {
      return res.status(404).json({
        success: false,
        message: 'Mother profile not found'
      });
    }

    // Extract data for the prompt
    const {
      fullName,
      age,
      pregnancyWeeks,
      pregnancyStage,
      familySupport,
      previousMentalHealthHistory,
      currentMentalHealthConcerns,
      moodTracking
    } = motherProfile;

    const {
      moodData,
      moodNotes,
      averageMood,
      numberOfMoodTracking,
      happyDays,
      moodLogs
    } = moodTracking;

    // Format current health concerns
    const healthConcerns = currentMentalHealthConcerns.length > 0 
      ? currentMentalHealthConcerns.join(', ') 
      : 'No current mental health concerns reported';

    // Format mood logs for better context
    const formattedMoodLogs = moodLogs.map(log => {
      const date = new Date(log.date).toLocaleDateString();
      return `Date: ${date}, Mood: ${log.mood}/5, Notes: "${log.notes.trim()}"`;
    }).join('\n');

    // Create comprehensive prompt for Gemini
    const prompt = `
The following is the medical data of a ${pregnancyWeeks}-week pregnant lady named ${fullName}, age ${age}.

CURRENT HEALTH CONCERNS: ${healthConcerns}

PREVIOUS MEDICAL HISTORY: ${previousMentalHealthHistory}

MOOD DATA: Over ${numberOfMoodTracking} days, mood ratings: [${moodData.join(', ')}]
(Scale: 1 = very sad, 2 = sad, 3 = neutral, 4 = happy, 5 = very happy)
Average mood: ${averageMood}/5, Happy days: ${happyDays}

MOOD NOTES BY MOTHER: 
${moodNotes.map((note, index) => `Day ${index + 1}: "${note.trim()}"`).join('\n')}

DETAILED MOOD LOGS:
${formattedMoodLogs}

ADDITIONAL CONTEXT:
- Pregnancy Stage: ${pregnancyStage}
- Family Support: ${familySupport}
if the pregnancy stage is postpartum , then concider pregnancy weeks as zero even if it is sent some number in prompt 
Based on this comprehensive data, please provide a detailed assessment and generate a personalized report for ${fullName} in the following format:

**Mother Health and Pregnancy:** [Provide a comprehensive summary of her current pregnancy situation, considering her stage, mood patterns, and overall wellbeing]

**Mood Data Summarised:** [Analyze the mood patterns, trends, and emotional state based on the data and notes provided]

**Medication Suggestions:** [Provide safe, pregnancy-appropriate recommendations considering her mental health history and current concerns. Include disclaimers about consulting healthcare providers and also add some medicines according to the current health and need]

**Tips for Mother:** [Provide personalized, practical advice for emotional wellbeing, pregnancy care, and mental health support]

Please ensure the response is personalized for ${fullName}, considering her age (${age}) and current pregnancy week (${pregnancyWeeks}). Make the tone supportive and professional.
`;

    // Generate report using Gemini
    const result = await model.generateContent(prompt);
    const generatedReport = await result.response.text();
    console.log(generatedReport)

    res.json({
      success: true,
      message: 'Report generated successfully',
      report: generatedReport,
      patientInfo: {
        name: fullName,
        age: age,
        pregnancyWeeks: pregnancyWeeks,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

module.exports = router;