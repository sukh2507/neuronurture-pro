// routes/doctorRoutes.js (Updated with enhanced consultation endpoints)
const express = require('express');
const router = express.Router();
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Consultation = require('../models/Consultation');
const auth = require('../middleware/auth');
const mongoose=require('mongoose')
const MotherProfile=require('../models/MotherProfile')

// EXISTING ROUTES (keep as they are)
// CREATE new doctor profile
router.post('/profile', auth, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can create doctor profiles.' });
    }

    // Check if profile already exists
    const existingProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Doctor profile already exists. Use PUT to update.' });
    }

    // Create new profile
    const profileData = {
      ...req.body,
      userId: req.user.id
    };

    const doctorProfile = new DoctorProfile(profileData);
    await doctorProfile.save();

    res.status(201).json(doctorProfile);
  } catch (error) {
    console.error('Error creating doctor profile:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE existing doctor profile
router.put('/profile/:profileId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can update doctor profiles.' });
    }

    const { patientUserId, ...updateFields } = req.body;

    console.log('🔐 Authenticated doctor userId:', req.user._id);
    console.log('📄 Target doctorProfileId:', req.params.profileId);
    console.log('📦 Body:', req.body);

    const doctorProfile = await DoctorProfile.findOne({
      _id: req.params.profileId,
      userId: req.user._id
    });

    if (!doctorProfile) {
      console.log('❌ Doctor profile not found or does not belong to logged-in user.');
      return res.status(404).json({ message: 'Doctor profile not found or not owned by you' });
    }

    console.log('✅ Found doctorProfile:', doctorProfile._id);

    if (patientUserId) {
      console.log('🧪 Validating patientUserId:', patientUserId);

      if (!mongoose.Types.ObjectId.isValid(patientUserId)) {
        return res.status(400).json({ message: 'Invalid patientUserId format' });
      }

      const alreadyExists = doctorProfile.patients.some(
        id => id.toString() === patientUserId
      );

      if (!alreadyExists) {
        doctorProfile.patients.push(patientUserId);
        console.log('✅ Patient added to doctor’s patients array');
      } else {
        console.log('ℹ️ Patient already in the list');
      }
    }

    Object.assign(doctorProfile, updateFields, { updatedAt: new Date() });

    console.log('💾 Saving doctor profile...');
    await doctorProfile.save();
    console.log('✅ Save successful');

    res.json(doctorProfile);

  } catch (error) {
    console.error('❌ Error updating doctor profile:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number already exists' });
    }

    res.status(500).json({ message: 'Server error' });
  }
});


// GET all patients of a doctor by profile ID
// GET route to fetch all patients for a specific doctor
router.get('/patients/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find the doctor profile by doctorId
    const doctorProfile = await DoctorProfile.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }

    // Check if doctor has any patients
    if (!doctorProfile.patients || doctorProfile.patients.length === 0) {
      return res.status(200).json({
        success: true,
        patients: [],
        message: 'No patients found for this doctor'
      });
    }

    // Get all User details for the patient IDs in doctor's patients array
    const patientUsers = await User.find({
      _id: { $in: doctorProfile.patients }
    }).select('_id email fullName profilePicture createdAt');

    // Get all MotherProfile details for these users
    const motherProfiles = await MotherProfile.find({
      userId: { $in: doctorProfile.patients }
    }).populate({
      path: 'userId',
      select: 'email fullName profilePicture createdAt'
    });

    // Combine the data to create comprehensive patient information
    const patientsData = motherProfiles.map(motherProfile => {
      const userInfo = motherProfile.userId;
      
      return {
        id: motherProfile._id,
        userId: userInfo._id,
        fullName: motherProfile.fullName,
        email: userInfo.email,
        profilePicture: userInfo.profilePicture,
        age: motherProfile.age,
        pregnancyStage: motherProfile.pregnancyStage,
        dueDate: motherProfile.dueDate,
        currentWeek: motherProfile.currentWeek,
        phone: motherProfile.phone,
        address: motherProfile.address,
        medicalHistory: motherProfile.medicalHistory,
        lastVisit: motherProfile.lastVisit,
        joinedDate: userInfo.createdAt,
        // Add any other fields you need from MotherProfile
      };
    });

    res.status(200).json({
      success: true,
      patients: patientsData,
      totalPatients: patientsData.length
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// DELETE route to remove a patient from doctor's care
router.delete('/patients/:doctorId/:patientId', auth, async (req, res) => {
  try {
    const { doctorId, patientId } = req.params;

    // Find the doctor profile
    const doctorProfile = await DoctorProfile.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }

    // Find the mother profile to get the userId
    const motherProfile = await MotherProfile.findById(patientId);
    
    if (!motherProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Remove the patient's userId from doctor's patients array
    doctorProfile.patients = doctorProfile.patients.filter(
      patientUserId => patientUserId.toString() !== motherProfile.userId.toString()
    );

    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: 'Patient removed successfully'
    });

  } catch (error) {
    console.error('Error removing patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});
//DELETE DOCTOR PROFILE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    // Find the user by ID and check if they are a doctor
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify that the user is actually a doctor
    if (user.role !== 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'User is not a doctor'
      });
    }

    // Find and delete the doctor profile first
    const doctorProfile = await DoctorProfile.findOne({ userId: id });
    
    if (doctorProfile) {
      await DoctorProfile.findByIdAndDelete(doctorProfile._id);
      console.log(`Doctor profile deleted for user: ${user.email}`);
    }

    // Delete the user account
    await User.findByIdAndDelete(id);
    
    console.log(`Doctor account deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: `Doctor ${user.email} has been successfully removed`,
      deletedDoctor: {
        id: user._id,
        email: user.email,
        role: user.role,
        hadProfile: !!doctorProfile
      }
    });

  } catch (error) {
    console.error('Error deleting doctor:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/by-user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('Fetching doctor profile for userId:', userId);
    
    // Find doctor profile by userId field
    const doctorProfile = await DoctorProfile.findOne({ userId: userId })
      .populate('userId', 'fullName email profilePicture');
    
    if (!doctorProfile) {
      return res.status(404).json({
        success: false,
        error: 'Doctor profile not found for this user'
      });
    }
    
    console.log('Doctor profile found:', doctorProfile._id);
    
    res.json({
      success: true,
      data: doctorProfile
    });
    
  } catch (error) {
    console.error('Error fetching doctor profile by userId:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor profile',
      details: error.message
    });
  }
});

// POST route to add a patient to doctor's care
router.post('/patients/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { patientEmail } = req.body;

    if (!patientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Patient email is required'
      });
    }

    // Find the doctor profile
    const doctorProfile = await DoctorProfile.findById(doctorId);
    
    if (!doctorProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: patientEmail });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found with this email' 
      });
    }

    // Check if user has a mother profile
    const motherProfile = await MotherProfile.findOne({ userId: user._id });
    
    if (!motherProfile) {
      return res.status(404).json({ 
        success: false,
        message: 'Mother profile not found for this user' 
      });
    }

    // Check if patient is already assigned to this doctor
    if (doctorProfile.patients.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Patient is already assigned to this doctor'
      });
    }

    // Add patient to doctor's patients array
    doctorProfile.patients.push(user._id);
    await doctorProfile.save();

    res.status(200).json({
      success: true,
      message: 'Patient added successfully',
      patient: {
        id: motherProfile._id,
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        age: motherProfile.age,
        pregnancyStage: motherProfile.pregnancyStage
      }
    });

  } catch (error) {
    console.error('Error adding patient:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// GET doctor profile by user ID
router.get('/profile/user/:userId', auth, async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'fullName email profilePicture');
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctorProfile);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile-id/:userId', auth, async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ userId: req.params.userId });

    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    res.json({ success: true, doctorId: doctorProfile._id });
  } catch (error) {
    console.error('Error fetching doctor profile ID:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET doctor profile by profile ID
router.get('/profile/:profileId', auth, async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findById(req.params.profileId)
      .populate('userId', 'fullName email profilePicture');
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctorProfile);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE doctor profile
router.delete('/profile/:profileId', auth, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can delete doctor profiles.' });
    }

    const doctorProfile = await DoctorProfile.findOneAndDelete({ 
      _id: req.params.profileId, 
      userId: req.user._id 
    });

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({ message: 'Doctor profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ENHANCED CONSULTATION ENDPOINTS

// GET /api/doctor/list - Fetch all doctors for consultation (ENHANCED)
router.get('/list', auth, async (req, res) => {
  try {
    const doctorProfiles = await DoctorProfile.find({
      $and: [
        { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
        { $or: [{ isVerified: true }, { isVerified: { $exists: false } }] }
      ]
    })
      .populate('userId', 'email profilePicture') // No fullName!
      .select('specialty experience fullName userId qualifications licenseNumber about consultationFee rating reviewCount profilePicture location isAvailable')
      .sort({ rating: -1, reviewCount: -1, createdAt: -1 });

    const doctors = doctorProfiles.map(profile => ({
      _id: profile._id,
      fullName: profile.fullName || 'Unknown Doctor',
      specialty: profile.specialty,
      experience: profile.experience,
      email: profile.userId?.email || 'No email',
      qualifications: profile.qualifications || [],
      licenseNumber: profile.licenseNumber,
      about: profile.about || '',
      consultationFee: profile.consultationFee || 0,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      profilePicture: profile.profilePicture || profile.userId?.profilePicture || null,
      location: profile.location || 'Unknown',
      isAvailable: profile.isAvailable !== false
    }));

    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});


// GET /api/doctor/search - Search doctors by specialty, name, or location
router.get('/search', auth, async (req, res) => {
  try {
    const { specialty, name, location, minRating, maxFee } = req.query;
    
    // Build search query
    let searchQuery = { 
      isActive: true,
      isVerified: { $ne: false }
    };

    // Add specialty filter
    if (specialty && specialty !== 'all') {
      searchQuery.specialty = { $regex: specialty, $options: 'i' };
    }

    // Add location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Add rating filter
    if (minRating) {
      searchQuery.rating = { $gte: parseFloat(minRating) };
    }

    // Add fee filter
    if (maxFee) {
      searchQuery.consultationFee = { $lte: parseFloat(maxFee) };
    }

    let doctorProfiles = await DoctorProfile.find(searchQuery)
      .populate('userId', 'fullName email profilePicture')
      .select('specialty experience userId qualifications licenseNumber about consultationFee rating reviewCount profilePicture location')
      .sort({ rating: -1, reviewCount: -1 });

    // Filter by name if provided (after population)
    if (name) {
      doctorProfiles = doctorProfiles.filter(profile => 
        profile.userId?.fullName?.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Format response
    const doctors = doctorProfiles.map(profile => ({
      _id: profile._id,
      fullName: profile.userId?.fullName || 'Unknown Doctor',
      specialty: profile.specialty,
      experience: profile.experience,
      email: profile.userId?.email || 'No email',
      qualifications: profile.qualifications || [],
      licenseNumber: profile.licenseNumber,
      about: profile.about || '',
      consultationFee: profile.consultationFee || 0,
      rating: profile.rating || 0,
      reviewCount: profile.reviewCount || 0,
      profilePicture: profile.profilePicture || profile.userId?.profilePicture || null,
      location: profile.location || '',
      isAvailable: profile.isAvailable !== false
    }));

    res.status(200).json({
      doctors,
      total: doctors.length,
      filters: { specialty, name, location, minRating, maxFee }
    });
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/doctor/specialties - Get all available specialties
router.get('/specialties', auth, async (req, res) => {
  try {
    const specialties = await DoctorProfile.distinct('specialty', { 
      isActive: true,
      isVerified: { $ne: false }
    });
    
    res.status(200).json(specialties.filter(s => s && s.trim() !== ''));
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// POST /api/doctor/consult - Send consultation request (ENHANCED)
router.post('/consult', auth, async (req, res) => {
  try {
    const { doctorId, message, urgency, preferredTime } = req.body;
    const userId = req.user._id;

    // Validation
    if (!doctorId || !message) {
      return res.status(400).json({ 
        message: 'Doctor ID and message are required' 
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Message must be at least 10 characters long' 
      });
    }

    // Check if doctor profile exists and is available
    const doctorProfile = await DoctorProfile.findById(doctorId);
    if (!doctorProfile) {
      return res.status(404).json({ 
        message: 'Doctor not found' 
      });
    }

    if (!doctorProfile.isActive) {
      return res.status(400).json({ 
        message: 'Doctor is currently not available for consultations' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check for existing pending consultation with same doctor
    const existingConsultation = await Consultation.findOne({
      userId: userId,
      doctorProfileId: doctorId,
      status: 'pending'
    });

    if (existingConsultation) {
      return res.status(400).json({
        message: 'You already have a pending consultation with this doctor'
      });
    }

    // Create consultation record with enhanced fields
    const consultation = new Consultation({
      userId: userId,
      doctorProfileId: doctorId,
      message: message.trim(),
      urgency: urgency || 'normal',
      preferredTime: preferredTime || null,
      status: 'pending',
      createdAt: new Date()
    });

    await consultation.save();

    // Populate the consultation for response
    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('doctorProfileId', 'specialty userId')
      .populate({
        path: 'doctorProfileId',
        populate: {
          path: 'userId',
          select: 'fullName'
        }
      });

    res.status(201).json({
      message: 'Consultation request sent successfully',
      consultation: populatedConsultation
    });

  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/doctor/consultations - Get user's consultation history (ENHANCED)
router.get('/consultations', auth, async (req, res) => {
  try {
    const doctorProfileId = req.user.profileId; // assume doctor is logged in

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = { doctorProfileId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate({
        path: 'doctorProfileId',
        select: 'specialty experience userId profilePicture',
        populate: {
          path: 'userId',
          select: 'fullName email profilePicture'
        }
      })
      .populate({
        path: 'userId', // MOTHER
        select: 'fullName email profilePicture'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Consultation.countDocuments(query);

    const formattedConsultations = consultations.map(consultation => ({
      _id: consultation._id,
      message: consultation.message,
      status: consultation.status,
      urgency: consultation.urgency,
      doctorResponse: consultation.doctorResponse,
      createdAt: consultation.createdAt,
      respondedAt: consultation.respondedAt,
      preferredTime: consultation.preferredTime,
      isApproved: consultation.isApproved,
      patient: {
        id: consultation.userId?._id,
        name: consultation.userId?.fullName || 'Unknown',
        email: consultation.userId?.email,
        profilePicture: consultation.userId?.profilePicture || null
      },
      doctor: {
        name: consultation.doctorProfileId?.userId?.fullName || 'Unknown Doctor',
        specialty: consultation.doctorProfileId?.specialty || 'General',
        profilePicture: consultation.doctorProfileId?.profilePicture ||
                        consultation.doctorProfileId?.userId?.profilePicture || null
      }
    }));

    res.status(200).json({
      consultations: formattedConsultations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching consultations for doctor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// GET /api/doctor/consultation/:id - Get specific consultation details
router.get('/consultation/:id', auth, async (req, res) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user._id;

    const consultation = await Consultation.findOne({ 
      _id: consultationId, 
      userId: userId 
    }).populate({
      path: 'doctorProfileId',
      select: 'specialty experience userId profilePicture qualifications',
      populate: {
        path: 'userId',
        select: 'fullName email profilePicture'
      }
    });

    if (!consultation) {
      return res.status(404).json({ 
        message: 'Consultation not found' 
      });
    }

    res.status(200).json(consultation);

  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/doctor/consultation/:id/cancel - Cancel consultation
router.put('/consultation/:id/cancel', auth, async (req, res) => {
  try {
    const consultationId = req.params.id;
    const userId = req.user._id;

    const consultation = await Consultation.findOneAndUpdate(
      { _id: consultationId, userId: userId, status: 'pending' },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ 
        message: 'Consultation not found or cannot be cancelled' 
      });
    }

    res.status(200).json({
      message: 'Consultation cancelled successfully',
      consultation
    });

  } catch (error) {
    console.error('Error cancelling consultation:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// DOCTOR-SPECIFIC ENDPOINTS (for doctors to manage their consultations)

// GET /api/doctor/my-consultations - Get consultations for the doctor
router.get('/my-consultations', auth, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can access this endpoint.' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    let query = { doctorProfileId: doctorProfile._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const consultations = await Consultation.find(query)
      .populate('userId', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Consultation.countDocuments(query);

    res.status(200).json({
      consultations,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching doctor consultations:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

router.get('/patients/:doctorId', auth, async (req, res) => {
  const doctor = await DoctorProfile.findById(req.params.doctorId);

  // Get all mother profiles whose userId is in doctor.patients
  const mothers = await MotherProfile.find({
    userId: { $in: doctor.patients }
  });

  res.json(mothers);
});


// PUT /api/doctor/consultation/:id/respond - Doctor responds to consultation
router.put('/consultation/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const consultationId = req.params.id;

    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can respond to consultations.' });
    }

    if (!response || response.trim().length < 10) {
      return res.status(400).json({ 
        message: 'Response must be at least 10 characters long' 
      });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { _id: consultationId, doctorProfileId: doctorProfile._id },
      { 
        doctorResponse: response.trim(),
        status: 'responded',
        respondedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ 
        message: 'Consultation not found' 
      });
    }

    res.status(200).json({
      message: 'Response sent successfully',
      consultation
    });

  } catch (error) {
    console.error('Error responding to consultation:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// PUT /api/doctor/availability - Update doctor availability
router.put('/availability', auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;

    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can update availability.' });
    }

    const doctorProfile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isAvailable: isAvailable, updatedAt: new Date() },
      { new: true }
    );

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.status(200).json({
      message: 'Availability updated successfully',
      isAvailable: doctorProfile.isAvailable
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/doctor/stats - Get consultation statistics for doctor
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can access this endpoint.' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get consultation statistics
    const totalConsultations = await Consultation.countDocuments({ 
      doctorProfileId: doctorProfile._id 
    });
    
    const pendingConsultations = await Consultation.countDocuments({ 
      doctorProfileId: doctorProfile._id, 
      status: 'pending' 
    });
    
    const respondedConsultations = await Consultation.countDocuments({ 
      doctorProfileId: doctorProfile._id, 
      status: 'responded' 
    });

    // Get recent consultations
    const recentConsultations = await Consultation.find({ 
      doctorProfileId: doctorProfile._id 
    })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('message status createdAt userId');

    res.status(200).json({
      stats: {
        total: totalConsultations,
        pending: pendingConsultations,
        responded: respondedConsultations,
        responseRate: totalConsultations > 0 ? Math.round((respondedConsultations / totalConsultations) * 100) : 0
      },
      recentConsultations
    });

  } catch (error) {
    console.error('Error fetching doctor stats:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;