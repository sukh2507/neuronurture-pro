const express = require('express');
const ChildProfile = require('../models/ChildProfile');
const MotherProfile = require('../models/MotherProfile');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Add Child Profile
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can add children
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can add children' });
    }

    const {
      fullName,
      dateOfBirth,
      gender,
      healthHistory,
      learningConcerns
    } = req.body;

    // Validation
    if (!fullName || !dateOfBirth || !gender) {
      return res.status(400).json({ error: 'Full name, date of birth, and gender are required' });
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be male, female, or other' });
    }

    // Validate date of birth is not in the future
    const birthDate = new Date(dateOfBirth);
    if (birthDate > new Date()) {
      return res.status(400).json({ error: 'Date of birth cannot be in the future' });
    }

    // Declare motherProfile variable in the outer scope
    let motherProfile = null;
    let motherName = req.user.email; // fallback to email

    // Get mother's profile to get the mother's name
    try {
      motherProfile = await MotherProfile.findOne({ userId: req.user._id });
      if (motherProfile && motherProfile.fullName) {
        motherName = motherProfile.fullName;
      }
    } catch (error) {
      console.log('Could not fetch mother profile, using email as fallback');
    }

    // Create new child profile
    const childProfile = new ChildProfile({
      motherId: req.user._id,
      motherName: motherName,
      fullName,
      dateOfBirth: birthDate,
      gender,
      healthHistory: healthHistory || [],
      learningConcerns: learningConcerns || [],
      screeningHistory: []
    });

    // Save the child profile
    const savedChild = await childProfile.save();

    // Update mother's currentChildren array
    if (motherProfile) {
      // Add the child's ID to the mother's currentChildren array
      motherProfile.currentChildren.push(savedChild._id);
      motherProfile.updatedAt = new Date();
      await motherProfile.save();
    } else {
      // If mother profile doesn't exist, create one with the child
      const newMotherProfile = new MotherProfile({
        userId: req.user._id,
        fullName: motherName,
        age: 25, // You might want to get this from the request or user input
        currentChildren: [savedChild._id]
      });
      await newMotherProfile.save();
    }

    res.status(201).json({
      message: 'Child added successfully',
      child: savedChild
    });

  } catch (error) {
    console.error('Child registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: validationErrors });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Child Profile
router.get('/:childId', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can access child profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can access child profiles' });
    }

    const { childId } = req.params;

    const child = await ChildProfile.findOne({ 
      _id: childId, 
      motherId: req.user._id 
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.json(child);

  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Child Profile
router.put('/:childId', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can update child profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can update child profiles' });
    }

    const { childId } = req.params;
    const {
      fullName,
      dateOfBirth,
      gender,
      healthHistory,
      learningConcerns
    } = req.body;

    const child = await ChildProfile.findOne({ 
      _id: childId, 
      motherId: req.user._id 
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Update fields if provided
    if (fullName !== undefined) child.fullName = fullName;
    if (dateOfBirth !== undefined) {
      const birthDate = new Date(dateOfBirth);
      if (birthDate > new Date()) {
        return res.status(400).json({ error: 'Date of birth cannot be in the future' });
      }
      child.dateOfBirth = birthDate;
    }
    if (gender !== undefined) {
      if (!['male', 'female', 'other'].includes(gender)) {
        return res.status(400).json({ error: 'Invalid gender' });
      }
      child.gender = gender;
    }
    if (healthHistory !== undefined) child.healthHistory = healthHistory;
    if (learningConcerns !== undefined) child.learningConcerns = learningConcerns;

    await child.save();

    res.json({
      message: 'Child profile updated successfully',
      child: child
    });

  } catch (error) {
    console.error('Child update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: 'Validation error', details: validationErrors });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Child Profile
router.delete('/:childId', authenticateToken, async (req, res) => {
  try {
    // Ensure only mothers can delete child profiles
    if (req.user.role !== 'mother') {
      return res.status(403).json({ error: 'Only mothers can delete child profiles' });
    }

    const { childId } = req.params;

    const child = await ChildProfile.findOneAndDelete({ 
      _id: childId, 
      motherId: req.user._id 
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Remove child from mother's currentChildren array
    try {
      await MotherProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $pull: { currentChildren: childId } }
      );
    } catch (error) {
      console.log('Could not update mother profile after child deletion');
    }

    res.json({
      message: 'Child profile deleted successfully'
    });

  } catch (error) {
    console.error('Child deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Screening Result to Child
// Add Screening Result to Child - FIXED VERSION
router.put('/screening/:childId', authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;
    console.log('=== SCREENING UPDATE DEBUG ===');
    console.log('Child ID:', childId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user._id);
    
    const { gameType, gameData } = req.body;

    // Validate required fields
    if (!gameType || !gameData) {
      console.log('Missing gameType or gameData');
      return res.status(400).json({ 
        message: 'Game type and game data are required',
        received: { gameType, gameData: !!gameData }
      });
    }

    // Validate gameType
    const validGameTypes = ['memoryMatch', 'wordAdventure', 'colorPattern', 'shapeSequence'];
    if (!validGameTypes.includes(gameType)) {
      console.log('Invalid game type:', gameType);
      return res.status(400).json({ 
        message: 'Invalid game type. Must be one of: ' + validGameTypes.join(', '),
        received: gameType
      });
    }

    // Check if child exists and user is authorized
    console.log('Looking for child with ID:', childId, 'and mother ID:', req.user._id);
    
    const child = await ChildProfile.findOne({
      _id: childId,
      motherId: req.user._id
    });

    if (!child) {
      console.log('Child not found or not authorized');
      return res.status(404).json({ 
        message: 'Child not found or not authorized',
        childId,
        userId: req.user._id
      });
    }

    console.log('Child found:', child.fullName);
    console.log('Current screening data:', child.screening);

    // FIXED: Initialize screening object if it doesn't exist
    if (!child.screening) {
      child.screening = {};
    }

    // FIXED: Update only the specific game field, preserving others
    child.screening[gameType] = gameData;
    child.updatedAt = new Date();

    // FIXED: Use save() instead of findByIdAndUpdate to ensure proper validation
    const updatedChild = await child.save();

    console.log('Update successful');
    console.log('Updated screening data:', updatedChild.screening);

    res.status(200).json({ 
      message: `${gameType} screening data updated successfully`, 
      child: updatedChild,
      debug: {
        gameType,
        dataReceived: Object.keys(gameData),
        allScreeningGames: Object.keys(updatedChild.screening || {})
      }
    });

  } catch (error) {
    console.error('=== SCREENING UPDATE ERROR ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: validationErrors,
        error: error.message
      });
    }
    
    if (error.name === 'CastError') {
      console.error('Cast error - likely invalid ObjectId');
      return res.status(400).json({ 
        message: 'Invalid child ID format',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      type: error.name
    });
  }
});

  // File: routes/child.js (append at the bottom)
const { GoogleGenerativeAI } = require("@google/generative-ai");
const moment = require("moment");
require("dotenv").config();

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/child/generate-report/:childId
router.post("/generate-report/:childId", authenticateToken, async (req, res) => {
  try {
    const { childId } = req.params;

    // Validate user role
    if (req.user.role !== 'mother') {
      return res.status(403).json({ 
        success: false, 
        message: "Only mothers can generate reports" 
      });
    }

    // Find the child
    const child = await ChildProfile.findOne({
      _id: childId,
      motherId: req.user._id
    });

    if (!child) {
      return res.status(404).json({ 
        success: false, 
        message: "Child not found or not authorized" 
      });
    }

    // Check if child has screening data
    if (!child.screening || Object.keys(child.screening).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No screening data available for this child. Please complete screenings first."
      });
    }

    const age = moment().diff(moment(child.dateOfBirth), 'years');

    // Extract game results based on mentalCheck
    const screeningData = child.screening || {};
    let dyslexiaGame = null;
    let adhdGame = null;
    let dysgraphiaGame = null;
    let dyscalculiaGame = null;

    // Process screening data
    for (const key in screeningData) {
      const entry = screeningData[key];
      if (entry && entry.mentalCheck) {
        switch (entry.mentalCheck.toLowerCase()) {
          case "dyslexia":
            dyslexiaGame = entry;
            break;
          case "adhd":
            adhdGame = entry;
            break;
          case "dysgraphia":
            dysgraphiaGame = entry;
            break;
          case "dyscalculia":
            dyscalculiaGame = entry;
            break;
        }
      }
    }

    // Prepare the structured prompt
    const prompt = `
Generate a detailed and supportive mental health report for a child based on the following profile and screening data.

**Child Information:**
Full Name: ${child.fullName}
Gender: ${child.gender}
Age: ${age} years
Date of Birth: ${moment(child.dateOfBirth).format("LL")}
Health History: ${child.healthHistory?.length > 0 ? child.healthHistory.map(h => h.condition).join(", ") : "No major health concerns reported"}
Learning Concerns: ${child.learningConcerns?.length > 0 ? child.learningConcerns.map(l => l.concern).join(", ") : "No specific learning concerns reported"}

**Screening Methods Explanation:**
1. Memory Match: Evaluates short-term memory, symbol recognition, and visual discrimination, useful for identifying dyslexia-related symptoms.
2. Word Adventure: Assesses attention span, impulsivity, and consistency, helping screen for ADHD.
3. Color Pattern: Measures fine motor control and pattern replication ability, helping identify dysgraphia.
4. Shape Pattern: Examines logical pattern recognition and spatial reasoning, useful for dyscalculia screening.

**Screening Results:**

Memory Match (Dyslexia Screening):
${child.screening?.memoryMatch ? 
  `Score: ${child.screening.memoryMatch.finalScore ?? 'N/A'}, Pairs Found: ${child.screening.memoryMatch.pairsFound ?? 'N/A'}, Time: ${child.screening.memoryMatch.timeUsed ?? 'N/A'} seconds` 
  : 'No data available'}

Word Adventure (ADHD Screening):
${child.screening?.wordAdventure ? 
  `Score: ${child.screening.wordAdventure.totalScore ?? 'N/A'}, Accuracy: ${child.screening.wordAdventure.accuracy ?? 'N/A'}%, Correct Patterns: ${child.screening.wordAdventure.correctPatternsFound ?? 'N/A'}, Time: ${child.screening.wordAdventure.timeUsed ?? 'N/A'} seconds`
  : 'No data available'}

Color Pattern (Dysgraphia Screening):
${child.screening?.colorPattern ? 
  `Score: ${child.screening.colorPattern.totalScore ?? 'N/A'}, Rounds Completed: ${child.screening.colorPattern.roundsCompleted ?? 'N/A'}, Best Streak: ${child.screening.colorPattern.bestStreak ?? 'N/A'}, Time: ${child.screening.colorPattern.timeUsed ?? 'N/A'} seconds`
  : 'No data available'}

Shape Pattern (Dyscalculia Screening):
${child.screening?.shapeSequence ? 
  `Score: ${child.screening.shapeSequence.totalScore ?? 'N/A'}, Levels Completed: ${child.screening.shapeSequence.levelsCompleted ?? 'N/A'}, Correct Answers: ${child.screening.shapeSequence.correctAnswers ?? 'N/A'}, Time: ${child.screening.shapeSequence.timeUsed ?? 'N/A'} seconds`
  : 'No data available'}

Please provide a comprehensive, parent-friendly report with the following sections:

**Dyslexia Screening Results**  
**Dysgraphia Screening Results**  
**Dyscalculia Screening Results**  
**ADHD Screening Results**  
**Overall Assessment and Recommendations**

Focus on providing supportive guidance, avoid medical diagnoses, and include practical next steps for parents.
`;

console.log(`the prompt is : ${prompt}`)
    // Generate content using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiText = await result.response.text();



    return res.status(200).json({
  success: true,
  message: "Report generated successfully",
  report: aiText,
  patientInfo: {
    name: child.fullName,
    age,
    dateOfBirth: child.dateOfBirth,
    generatedAt: new Date().toISOString(),
    isChild: true // ✅ ADD THIS
  }
});


  } catch (err) {
    console.error("Child Report Generation Error:", err);
    
    if (err.message && err.message.includes('API_KEY')) {
      return res.status(500).json({ 
        success: false, 
        message: "AI service configuration error. Please contact support." 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate report. Please try again." 
    });
  }
});




module.exports = router;