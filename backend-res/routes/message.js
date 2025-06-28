const express = require('express');
const router = express.Router();

const Message = require('../models/Message');
const authenticateToken = require('../middleware/auth');

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, receiverModel, content } = req.body;

    const newMessage = new Message({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      content
    });

    const saved = await newMessage.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation between two users
router.get('/conversation', authenticateToken, async (req, res) => {
  try {
    const { user1Id, user1Model, user2Id, user2Model } = req.query;

    const messages = await Message.find({
      $or: [
        {
          senderId: user1Id,
          senderModel: user1Model,
          receiverId: user2Id,
          receiverModel: user2Model
        },
        {
          senderId: user2Id,
          senderModel: user2Model,
          receiverId: user1Id,
          receiverModel: user1Model
        }
      ]
    }).sort({ sentAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all conversations of a user (distinct receiver list)
router.get('/my-conversations/:userId/:userModel', authenticateToken, async (req, res) => {
  try {
    const { userId, userModel } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, senderModel: userModel },
        { receiverId: userId, receiverModel: userModel }
      ]
    });

    const uniquePartners = new Map();

    messages.forEach(msg => {
      const isSender = msg.senderId.toString() === userId;
      const otherId = isSender ? msg.receiverId.toString() : msg.senderId.toString();
      const otherModel = isSender ? msg.receiverModel : msg.senderModel;

      const key = `${otherModel}-${otherId}`;
      if (!uniquePartners.has(key)) {
        uniquePartners.set(key, {
          userId: otherId,
          userModel: otherModel,
          lastMessage: msg.content,
          lastTime: msg.sentAt
        });
      }
    });

    res.json(Array.from(uniquePartners.values()));
  } catch (err) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});


// ✅ Marks messages from a mother as seen by the doctor
router.post('/mark-seen', async (req, res) => {
  const { doctorId, motherId } = req.body;

  if (!doctorId || !motherId) {
    return res.status(400).json({ error: 'doctorId and motherId are required' });
  }

  try {
    await Message.updateMany(
      {
        senderId: motherId,
        receiverId: doctorId,
        receiverModel: 'Doctor',
        seenByDoctor: false
      },
      { $set: { seenByDoctor: true } }
    );

    res.status(200).json({ message: 'Messages marked as seen' });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/for-doctor/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log('Fetching messages for doctor:', doctorId);

    const allMessages = await Message.find({ 
      receiverId: doctorId,
      receiverModel: 'Doctor' 
    }).sort({ sentAt: -1 });

    console.log('Found messages:', allMessages.length);

    const grouped = {};
    for (const msg of allMessages) {
      if (!grouped[msg.senderId]) {
        grouped[msg.senderId] = {
          motherId: msg.senderId,
          name: 'Mother', // You can populate this with real name later
          latestMessage: msg.content,
          sentAt: msg.sentAt,
          seen: msg.seenByDoctor || false,
        };
      }
    }

    const allGrouped = Object.values(grouped);
    const newMsgs = allGrouped.filter(m => !m.seen);
    const seenMsgs = allGrouped.filter(m => m.seen);

    console.log('Returning:', { new: newMsgs.length, seen: seenMsgs.length });

    res.json({
      new: newMsgs,
      seen: seenMsgs
    });
  } catch (error) {
    console.error('Error fetching messages for doctor:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/history/:doctorId/:motherId', authenticateToken, async (req, res) => {
  try {
    const { doctorId, motherId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: doctorId,
          senderModel: 'Doctor',
          receiverId: motherId,
          receiverModel: 'MotherProfile'
        },
        {
          senderId: motherId,
          senderModel: 'MotherProfile',
          receiverId: doctorId,
          receiverModel: 'Doctor'
        }
      ]
    }).sort({ sentAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
});

module.exports = router;