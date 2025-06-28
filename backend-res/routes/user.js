const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if needed
const MotherProfile = require('../models/MotherProfile'); // ✅ Add this
const DoctorProfile = require('../models/DoctorProfile'); // ✅ Add this
const authenticateToken = require('../middleware/auth'); // Your JWT middleware

// @route   GET /api/users
// @desc    Get all users
// @access  Protected
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user and their associated mother/doctor profile
// @access  Protected
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove associated profile based on role
    if (user.role === 'mother') {
      await MotherProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      await DoctorProfile.deleteOne({ userId: user._id });
    }

    // Remove user from User collection
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: 'User and associated profile deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
