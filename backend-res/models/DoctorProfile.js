// models/DoctorProfile.js (Enhanced)
const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
  type: String,
  required: true,
  trim: true,
},
  bio: {
  type: String,
  trim: true,
  maxlength: 1000
},
  medicalDegree: {
    type: String,
    required: true,
    trim: true,
  },
  medicalSchool: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true }
},

// Availability schedule (1 object per day)
availabilitySchedule: {
  monday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  tuesday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  wednesday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  thursday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  friday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  saturday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  },
  sunday: {
    isAvailable: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String }
  }
},

  graduationYear: {
    type: Number,
    required: true,
    min: 1950,
    max: new Date().getFullYear()
  },
  // Basic Information
  specialty: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
      'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
      'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
      'Surgery', 'Urology', 'Ophthalmology', 'ENT', 'Anesthesia',
      'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
      'Pathology', 'Pulmonology', 'Rheumatology', 'Nephrology',
      'Hematology', 'Infectious Disease', 'Allergy & Immunology',
      'Physical Medicine', 'Plastic Surgery', 'Preventive Medicine'
    ]
  },
  experience: {
  type: Number,
  required: true,
  min: 0,
  max: 100,
  validate: {
    validator: function (value) {
      if (!this.graduationYear) return true; // skip if graduationYear is missing
      const currentYear = new Date().getFullYear();
      const yearsSinceGraduation = currentYear - this.graduationYear;
      return value <= yearsSinceGraduation;
    },
    message: props => `Experience (${props.value} years) cannot exceed years since graduation (${new Date().getFullYear() - props.instance.graduationYear} years).`
  }
},
  qualifications: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear()
    },
    verified: {
      type: Boolean,
      default: true
    }
  }],
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Profile Information
  about: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  profilePicture: {
    type: String,
    default: null
  },
  
  // Contact & Location
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  country: { type: String, trim: true }
},
  
  // Professional Details
 hospitalAffiliations: [{
  name: { type: String, trim: true },
  position: { type: String, trim: true },
  startDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!this.graduationYear || !value) return true;
        const gradDate = new Date(`${this.graduationYear}-01-01`);
        return value >= gradDate;
      },
      message: props => `Start date (${props.value.toISOString().split('T')[0]}) must be after graduation year (${props.instance.graduationYear}).`
    }
  },
  endDate: { type: Date },
  current: { type: Boolean, default: false }
}],
  
  // Consultation Details
  consultationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  consultationTypes: [{
    type: String,
    enum: ['online', 'in-person', 'phone', 'video']
  }],
  availableSlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Status & Availability
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'under_review'],
    default: 'pending'
  },
  verificationDate: Date,
  
  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Languages
  languages: [{
    type: String,
    trim: true
  }],
  
  // Specializations within specialty
  subSpecializations: [{
    type: String,
    trim: true
  }],
  
  // Awards & Certifications
  awards: [{
    title: String,
    organization: String,
    year: Number,
    description: String
  }],
  
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Research & Publications
  publications: [{
    title: String,
    journal: String,
    year: Number,
    url: String,
    authors: [String]
  }],
  
  // Insurance & Payment
  insuranceAccepted: [{
    type: String,
    trim: true
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'insurance', 'online', 'upi', 'wallet']
  }],
  
  // Statistics
  totalConsultations: {
    type: Number,
    default: 0
  },
  completedConsultations: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Admin fields
  adminNotes: {
    type: String,
    trim: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  patients: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}],

});

// Indexes for better performance
doctorProfileSchema.index({ userId: 1 });
doctorProfileSchema.index({ specialty: 1 });
doctorProfileSchema.index({ 'location.city': 1 });
doctorProfileSchema.index({ 'location.state': 1 });
doctorProfileSchema.index({ rating: -1 });
doctorProfileSchema.index({ reviewCount: -1 });
doctorProfileSchema.index({ isActive: 1, isVerified: 1 });
doctorProfileSchema.index({ consultationFee: 1 });
doctorProfileSchema.index({ experience: -1 });
doctorProfileSchema.index({ createdAt: -1 });

// Compound indexes
doctorProfileSchema.index({ specialty: 1, 'location.city': 1, isActive: 1 });
doctorProfileSchema.index({ rating: -1, reviewCount: -1, isActive: 1 });

// Virtual for full location
doctorProfileSchema.virtual('fullLocation').get(function() {
  if (!this.location) return '';
  const parts = [];
  if (this.location.city) parts.push(this.location.city);
  if (this.location.state) parts.push(this.location.state);
  if (this.location.country) parts.push(this.location.country);
  return parts.join(', ');
});

// Virtual for years of experience text
doctorProfileSchema.virtual('experienceText').get(function() {
  if (this.experience === 1) return '1 year';
  return `${this.experience} years`;
});

// Virtual for consultation fee text
doctorProfileSchema.virtual('consultationFeeText').get(function() {
  if (this.consultationFee === 0) return 'Free';
  return `₹${this.consultationFee}`;
});

// Pre-save middleware
doctorProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update last active time if availability changes
  if (this.isModified('isAvailable')) {
    this.lastActiveAt = new Date();
  }
  
  next();
});

// Instance method to update rating
doctorProfileSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  this.totalRatings = totalRating;
  
  return this.save();
};

// Instance method to check availability
doctorProfileSchema.methods.isAvailableForConsultation = function() {
  return this.isActive && this.isAvailable && this.isVerified;
};

// Instance method to get availability today
doctorProfileSchema.methods.getTodayAvailability = function() {
  const today = new Date().toLocaleLowerCase();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = days[new Date().getDay()];
  
  return this.availableSlots.filter(slot => 
    slot.day === todayName && slot.isAvailable
  );
};

// Static method to get top doctors
doctorProfileSchema.statics.getTopDoctors = function(limit = 10) {
  return this.find({ 
    isActive: true, 
    isVerified: true,
    reviewCount: { $gt: 0 }
  })
  .populate('userId', 'fullName email profilePicture')
  .sort({ rating: -1, reviewCount: -1 })
  .limit(limit);
};

// Static method to search doctors
doctorProfileSchema.statics.searchDoctors = function(searchParams) {
  const { specialty, location, minRating, maxFee, experience, availability } = searchParams;
  
  let query = { isActive: true, isVerified: true };
  
  if (specialty) {
    query.specialty = specialty;
  }
  
  if (location) {
    query.$or = [
      { 'location.city': new RegExp(location, 'i') },
      { 'location.state': new RegExp(location, 'i') }
    ];
  }
  
  if (minRating) {
    query.rating = { $gte: minRating };
  }
  
  if (maxFee) {
    query.consultationFee = { $lte: maxFee };
  }
  
  if (experience) {
    query.experience = { $gte: experience };
  }
  
  if (availability) {
    query.isAvailable = true;
  }
  
  return this.find(query)
    .populate('userId', 'fullName email profilePicture')
    .sort({ rating: -1, reviewCount: -1 });
};

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);