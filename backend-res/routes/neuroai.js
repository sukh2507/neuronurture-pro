// Backend Routes for NeuroAI Chat with Gemini Integration
// Add these routes to your Express.js backend

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const MotherProfile = require('../models/MotherProfile'); // Adjust path as needed
const auth = require('../middleware/auth'); // Your auth middleware
require("dotenv").config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// GET /api/neuroai/chat - Get chat history
router.get('/chat', auth, async (req, res) => {
  try {
    const motherProfile = await MotherProfile.findOne({ userId: req.user.id });
    
    if (!motherProfile) {
      return res.status(404).json({ message: 'Mother profile not found' });
    }

    // Return the messages object
    res.json({
      messages: motherProfile.messages || { mother: [], ai: [] }
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/neuroai/chat - Send message and get AI response
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    let motherProfile = await MotherProfile.findOne({ userId: req.user.id });
    
    if (!motherProfile) {
      return res.status(404).json({ message: 'Mother profile not found' });
    }

    // Initialize messages if not exists
    if (!motherProfile.messages) {
      motherProfile.messages = { mother: [], ai: [] };
    }

    // Add mother's message
    motherProfile.messages.mother.push({
      message: message.trim(),
      timestamp: new Date()
    });

    // Generate AI response using Gemini
    const aiResponse = await generateGeminiResponse(message, motherProfile);

    // Add AI response
    motherProfile.messages.ai.push({
      message: aiResponse,
      timestamp: new Date()
    });

    // Save to database
    await motherProfile.save();

    res.json({
      success: true,
      userMessage: message.trim(),
      aiResponse: aiResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/neuroai/chat - Clear chat history
router.delete('/chat', auth, async (req, res) => {
  try {
    const motherProfile = await MotherProfile.findOne({ userId: req.user.id });
    
    if (!motherProfile) {
      return res.status(404).json({ message: 'Mother profile not found' });
    }

    // Clear messages
    motherProfile.messages = { mother: [], ai: [] };
    await motherProfile.save();

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Function to generate AI response using Gemini
async function generateGeminiResponse(userMessage, motherProfile) {
  try {
    // Build context from mother profile for personalized responses
    const context = buildContextPrompt(motherProfile);
    
    // Create a comprehensive prompt for Gemini
    const prompt = `${context}

User Message: "${userMessage}"

Please provide a supportive, empathetic, and helpful response as NeuroAI, a mental health companion for mothers. 

Guidelines:
- Be warm, understanding, and non-judgmental
- Provide evidence-based information when appropriate
- Encourage professional help when needed
- Keep responses conversational and supportive
- Focus on maternal mental health, parenting, and wellness
- Avoid giving medical diagnoses or specific medical advice
- Be encouraging and validate their feelings

Response:`;

    // Generate response using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    return response.trim();
    
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    
    // Fallback to basic response if Gemini fails
    return generateFallbackResponse(userMessage, motherProfile);
  }
}

// Helper function to build context from mother profile
function buildContextPrompt(motherProfile) {
  let context = `You are NeuroAI, a compassionate AI mental health companion specifically designed to support mothers with their mental health, parenting challenges, and overall wellness.

Context about this user:`;

  // Add user's name if available
  if (motherProfile.fullName) {
    context += `\n- User's name: ${motherProfile.fullName}`;
  }

  // Add children information
  if (motherProfile.children && motherProfile.children.length > 0) {
    context += `\n- Has ${motherProfile.children.length} child(ren):`;
    motherProfile.children.forEach((child, index) => {
      context += `\n  - Child ${index + 1}: ${child.name || 'Name not provided'}, Age: ${child.age || 'Age not provided'}`;
    });
  }

  // Add recent mood information
  if (motherProfile.moodTracking?.moodLogs && motherProfile.moodTracking.moodLogs.length > 0) {
    const recentMood = motherProfile.moodTracking.moodLogs[motherProfile.moodTracking.moodLogs.length - 1];
    context += `\n- Recent mood rating: ${recentMood.mood}/5`;
    if (recentMood.notes) {
      context += ` (Notes: ${recentMood.notes})`;
    }
  }

  // Add recent chat history for better context (last 3 messages)
  if (motherProfile.messages) {
    const motherMessages = motherProfile.messages.mother || [];
    const aiMessages = motherProfile.messages.ai || [];
    
    if (motherMessages.length > 0 || aiMessages.length > 0) {
      context += `\n\nRecent conversation context (last few messages):`;
      
      // Get the last 3 pairs of messages for context
      const recentCount = Math.min(3, Math.max(motherMessages.length, aiMessages.length));
      
      for (let i = Math.max(0, motherMessages.length - recentCount); i < motherMessages.length; i++) {
        if (motherMessages[i]) {
          context += `\nUser: ${motherMessages[i].message}`;
        }
        if (aiMessages[i]) {
          context += `\nAI: ${aiMessages[i].message}`;
        }
      }
    }
  }

  return context;
}

// Fallback response function (your original logic)
function generateFallbackResponse(userMessage, motherProfile) {
  const message = userMessage.toLowerCase();
  const context = {
    hasChildren: motherProfile.children && motherProfile.children.length > 0,
    recentMood: motherProfile.moodTracking?.moodLogs?.[motherProfile.moodTracking.moodLogs.length - 1]?.mood,
    motherName: motherProfile.fullName
  };

  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
  const moodKeywords = ['feel', 'mood', 'sad', 'happy', 'anxious', 'depressed', 'stressed', 'overwhelmed'];
  const parentingKeywords = ['child', 'baby', 'toddler', 'parenting', 'development', 'behavior'];
  const supportKeywords = ['help', 'support', 'advice', 'guidance', 'what should i do'];

  if (greetings.some(greeting => message.includes(greeting))) {
    return `Hello${context.motherName ? ` ${context.motherName}` : ''}! I'm NeuroAI, your mental health companion. How are you feeling today? I'm here to support you with any questions about maternal mental health, parenting, or general wellness.`;
  }

  if (moodKeywords.some(keyword => message.includes(keyword))) {
    let response = "I understand you're sharing about how you're feeling. Your emotions are valid and important. ";
    
    if (context.recentMood) {
      if (context.recentMood <= 2) {
        response += "I noticed from your recent mood tracking that you've been having some difficult days. ";
      } else if (context.recentMood >= 4) {
        response += "It's wonderful to see from your mood tracking that you've been feeling more positive lately. ";
      }
    }
    
    response += "Remember that it's normal for mothers to experience a wide range of emotions. Would you like to talk about what's contributing to how you're feeling, or would you prefer some coping strategies?";
    return response;
  }

  if (parentingKeywords.some(keyword => message.includes(keyword))) {
    let response = "Parenting can be both rewarding and challenging. ";
    
    if (context.hasChildren) {
      response += "I see you have children in your profile. Every child develops at their own pace, and you're doing a great job by being attentive to their needs. ";
    }
    
    response += "What specific aspect of parenting or child development would you like to discuss? I can provide information about developmental milestones, behavioral strategies, or supporting your child's emotional well-being.";
    return response;
  }

  if (supportKeywords.some(keyword => message.includes(keyword))) {
    return "I'm here to provide support and guidance. While I can't replace professional medical advice, I can offer evidence-based information about mental health, parenting strategies, and wellness practices. What specific area would you like help with? Remember, seeking support is a sign of strength, not weakness.";
  }

  // Default response
  return "Thank you for sharing that with me. I'm here to support you with mental health, parenting, and wellness questions. Could you tell me more about what you'd like to discuss? I'm here to listen and provide helpful information and coping strategies.";
}

module.exports = router;

// Don't forget to add this route to your main app.js file:
// app.use('/api/neuroai', require('./routes/neuroai'));

// Also make sure to install the required dependency:
// npm install @google/generative-ai