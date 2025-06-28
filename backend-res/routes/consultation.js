const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const auth = require('../middleware/auth');
const MotherProfile = require('../models/MotherProfile');
const DoctorProfile = require('../models/DoctorProfile'); // add at top if missing
const User = require('../models/User'); // to verify existence

// POST: Create a new consultation
router.post('/consult', auth, async (req, res) => {
  try {
    const { doctorId, message, urgency } = req.body;
    const patient = req.user;

    // You must fetch the doctor's name via profile if not included in the request
    const doctorProfile = await DoctorProfile.findById(doctorId);
    if (!doctorProfile) return res.status(404).json({ message: 'Doctor not found' });

    const newConsult = new Consultation({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId,
      doctorName: doctorProfile.fullName,
      message,
      urgency
    });

    await newConsult.save();
    res.status(201).json(newConsult);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Get all consultations for a doctor
// GET consultations for a specific doctor with mother's (user) info
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({
      doctorProfileId: req.params.doctorId
    }).sort({ createdAt: -1 });

    // 🔄 Load all matching MotherProfiles in one go
    const userIds = consultations.map(c => c.userId);
    const motherProfiles = await MotherProfile.find({ userId: { $in: userIds } })
      .select('fullName email profilePicture userId');

    // 🔁 Create a map for fast lookup
    const motherMap = new Map(
      motherProfiles.map(m => [m.userId.toString(), m])
    );

    // Format consultations
    const formatted = consultations.map(c => {
      const mother = motherMap.get(c.userId.toString());

      return {
        _id: c._id,
        message: c.message,
        urgency: c.urgency,
        status: c.status,
        isApproved: c.isApproved,
        preferredTime: c.preferredTime,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        doctorResponse: c.doctorResponse,

        patientName: mother?.fullName || 'Unknown',
        patientId: mother?._id || null,
        patientEmail: mother?.email || null,
        patientProfilePicture: mother?.profilePicture || null
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ Error fetching consultations:', err);
    res.status(500).json({ message: err.message });
  }
});


// this is an experiment 
// PATCH: Approve or reject consultation
// router.patch('/:id', auth, async (req, res) => {
//   try {
//     const consultation = await Consultation.findById(req.params.id);
//     if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

//     consultation.isApproved = req.body.isApproved;
//     await consultation.save();
//     res.json(consultation);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



router.patch('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    consultation.isApproved = req.body.isApproved;
    await consultation.save();

    // If approved, add user to doctor's patients list
    if (req.body.isApproved) {
      const doctorProfile = await DoctorProfile.findById(consultation.doctorProfileId);
      if (!doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });

      // consultation.userId is already the User._id, no need to find MotherProfile
      const userId = consultation.userId;

      console.log('👤 Adding User ID to patients:', userId);

      // Add only if not already added
      if (!doctorProfile.patients.includes(userId)) {
        doctorProfile.patients.push(userId);
        await doctorProfile.save();
        console.log('✅ Patient added to doctor profile');
      } else {
        console.log('ℹ️ Patient already exists in doctor profile');
      }
    }

    res.json(consultation);
  } catch (err) {
    console.error('❌ Error in consultation patch:', err);
    res.status(500).json({ message: err.message });
  }
});


// PATCH: Schedule a consultation with preferredTime
router.patch('/:id/schedule', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    const { preferredTime } = req.body;
    consultation.preferredTime = new Date(preferredTime);
    consultation.status = 'responded'; // or 'scheduled' if you prefer a custom status

    await consultation.save();
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
