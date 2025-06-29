const express = require('express');
  const router = express.Router();
  const Message = require('../models/Message');
  const authenticateToken = require('../middleware/auth');
  const User = require('../models/User'); 

  // TEMPORARY: Test route without authentication
  router.get('/test/:doctorId/:motherId', async (req, res) => {
    try {
      const { doctorId, motherId } = req.params;
      
      console.log('TEST ROUTE - Fetching messages for doctorId:', doctorId, 'motherId:', motherId);
      
      res.json({
        success: true,
        message: 'Route is working',
        params: { doctorId, motherId },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test route error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get messages between doctor and mother
  router.get('/:doctorId/:motherId', authenticateToken, async (req, res) => {
    try {
      const { doctorId, motherId } = req.params;

      console.log('Fetching messages for doctorId:', doctorId, 'motherId:', motherId);

      // Find messages between doctor and mother
      const messages = await Message.find({
        doctorId: doctorId, 
        motherId: motherId
      }).sort({ createdAt: 1 });

      console.log('Found messages:', messages.length);

      res.json({
        success: true,
        data: messages,
        count: messages.length
      });

    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages',
        details: error.message
      });
    }
  });

  // Send a new message
  router.post('/send', authenticateToken, async (req, res) => {
    try {
      const { doctorId, motherId, content, senderRole } = req.body;

      console.log('Message sending request:', { doctorId, motherId, content, senderRole });
      console.log('Request user:', req.user);

      // Validation
      if (!doctorId || !motherId || !content || !senderRole) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: doctorId, motherId, content, senderRole'
        });
      }

      if (!['doctor', 'mother'].includes(senderRole)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid senderRole. Must be either "doctor" or "mother"'
        });
      }

      // Create new message
      const newMessage = new Message({
        doctorId,
        motherId,
        content: content.trim(),
        senderRole,
        createdAt: new Date(),
        seen: false
      });

      const savedMessage = await newMessage.save();
      console.log('Message saved successfully:', savedMessage._id);

      res.status(201).json({
        success: true,
        data: savedMessage,
        message: 'Message sent successfully'
      });

    } catch (error) {
      console.error('Message sending error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message',
        details: error.message
      });
    }
  });

  // Mark messages as seen
  router.put('/mark-seen/:messageId', authenticateToken, async (req, res) => {
    try {
      const { messageId } = req.params;

      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { seen: true },
        { new: true }
      );

      if (!updatedMessage) {
        return res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }

      res.json({
        success: true,
        data: updatedMessage,
        message: 'Message marked as seen'
      });

    } catch (error) {
      console.error('Error marking message as seen:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark message as seen'
      });
    }
  });

  // Get messages for doctor's message view (grouped by mother)
// Enhanced debug version of the /for-doctor route
router.get('/for-doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    console.log('Fetching messages for doctor view, doctorId:', doctorId);
    console.log('doctorId type:', typeof doctorId);

    // First, check if there are ANY messages for this doctor
    const totalMessagesForDoctor = await Message.countDocuments({ doctorId });
    console.log('Total messages for this doctor:', totalMessagesForDoctor);

    // Check all messages in the collection (for debugging)
    const allMessages = await Message.find({}).limit(5);
    console.log('Sample messages in collection:', allMessages.map(m => ({
      _id: m._id,
      doctorId: m.doctorId,
      motherId: m.motherId,
      content: m.content.substring(0, 50),
      senderRole: m.senderRole,
      doctorIdType: typeof m.doctorId
    })));

    // If no messages found, return early with debug info
    if (totalMessagesForDoctor === 0) {
      return res.json({
        success: true,
        new: [],
        seen: [],
        debug: {
          doctorId,
          doctorIdType: typeof doctorId,
          totalMessagesForDoctor,
          message: 'No messages found for this doctor'
        }
      });
    }

    const conversations = await Message.aggregate([
      {
        $match: { doctorId }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$motherId',
          motherId: { $first: '$motherId' },
          latestMessage: { $first: '$content' },
          sentAt: { $first: '$createdAt' },
          senderRole: { $first: '$senderRole' },
          totalMessages: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$senderRole', 'mother'] },
                  { $eq: ['$seen', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { sentAt: -1 }
      }
    ]);

    console.log('Conversations fetched:', conversations.length);
    console.log('Conversations data:', conversations);

    const newMessages = [];
    const seenMessages = [];

    for (const convo of conversations) {
      let motherName = `Mother ${convo.motherId.slice(-4)}`;

      // Optional: Fetch real mother name from User collection
      // Only try this if User model is imported
      try {
        // Check if User is defined before using it
        if (typeof User !== 'undefined') {
          const mother = await User.findById(convo.motherId).select('name');
          if (mother && mother.name) motherName = mother.name;
        }
      } catch (e) {
        console.warn('Could not fetch mother name for:', convo.motherId, e.message);
      }

      const messageData = {
        motherId: convo.motherId,
        name: motherName,
        latestMessage: convo.latestMessage,
        sentAt: convo.sentAt,
        messageCount: convo.totalMessages,
        unreadCount: convo.unreadCount
      };

      if (convo.unreadCount > 0) {
        newMessages.push(messageData);
      } else {
        seenMessages.push(messageData);
      }
    }

    res.json({
      success: true,
      new: newMessages,
      seen: seenMessages,
      debug: {
        doctorId,
        totalMessagesForDoctor,
        conversationsFound: conversations.length
      }
    });

  } catch (error) {
    console.error('Error in /for-doctor route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      details: error.message
    });
  }
});

  // Mark all messages from a mother as seen
  router.post('/mark-seen', authenticateToken, async (req, res) => {
    try {
      const { doctorId, motherId } = req.body;

      console.log('Marking messages as seen:', { doctorId, motherId });

      if (!doctorId || !motherId) {
        return res.status(400).json({
          success: false,
          error: 'Missing doctorId or motherId'
        });
      }

      // Update all unseen messages from this mother to this doctor
      const result = await Message.updateMany(
        {
          doctorId: doctorId,
          motherId: motherId,
          senderRole: 'mother', // Only mark mother's messages as seen
          seen: false
        },
        {
          $set: { seen: true, updatedAt: new Date() }
        }
      );

      console.log('Messages marked as seen:', result.modifiedCount);

      res.json({
        success: true,
        modifiedCount: result.modifiedCount,
        message: 'Messages marked as seen'
      });

    } catch (error) {
      console.error('Error marking messages as seen:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark messages as seen'
      });
    }
  });

  router.get('/debug/all-messages', async (req, res) => {
  try {
    const messages = await Message.find({}).limit(10);
    res.json({
      success: true,
      totalMessages: await Message.countDocuments({}),
      sampleMessages: messages.map(m => ({
        _id: m._id,
        doctorId: m.doctorId,
        motherId: m.motherId,
        content: m.content.substring(0, 50) + '...',
        senderRole: m.senderRole,
        seen: m.seen,
        createdAt: m.createdAt,
        types: {
          doctorId: typeof m.doctorId,
          motherId: typeof m.motherId
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


  // Get unread message count for a user
  router.get('/unread-count/:userId/:userRole', authenticateToken, async (req, res) => {
    try {
      const { userId, userRole } = req.params;

      let query = { seen: false };

      if (userRole === 'doctor') {
        // Count unread messages sent TO the doctor (from mothers)
        query.doctorId = userId;
        query.senderRole = 'mother';
      } else if (userRole === 'mother') {
        // Count unread messages sent TO the mother (from doctors)
        query.motherId = userId;
        query.senderRole = 'doctor';
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid userRole'
        });
      }

      const unreadCount = await Message.countDocuments(query);

      res.json({
        success: true,
        unreadCount
      });

    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get unread count'
      });
    }
  });

  module.exports = router;