import React, { useState, useEffect } from 'react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  User,
  Edit,
  Save,
  GraduationCap,
  MapPin,
  Award,
  Building,
  DollarSign,
  Clock,
  Plus,
  X,
  Trash2
} from 'lucide-react';

const DoctorProfileView = ({ doctorProfile, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    phoneNumber: '',
    bio: '',
    languages: [],
    profilePhoto: '',
    
    // Professional Information
    specialty: '',
    licenseNumber: '',
    experience: '',
    medicalDegree: '',
    medicalSchool: '',
    graduationYear: '',
    
    // Contact Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    
    // Certifications
    certifications: [],
    
    // Hospital Affiliations
    hospitalAffiliations: [],
    
    // Consultation Settings
    consultationFee: '',
    consultationDuration: 30,
    availabilitySchedule: {
      monday: { isAvailable: false, startTime: '', endTime: '' },
      tuesday: { isAvailable: false, startTime: '', endTime: '' },
      wednesday: { isAvailable: false, startTime: '', endTime: '' },
      thursday: { isAvailable: false, startTime: '', endTime: '' },
      friday: { isAvailable: false, startTime: '', endTime: '' },
      saturday: { isAvailable: false, startTime: '', endTime: '' },
      sunday: { isAvailable: false, startTime: '', endTime: '' }
    }
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: ''
  });
  const [newHospitalAffiliation, setNewHospitalAffiliation] = useState({
    hospitalName: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  // Populate form data when doctorProfile changes
  useEffect(() => {
    if (doctorProfile) {
      setFormData({
        fullName: doctorProfile.fullName || '',
        phoneNumber: doctorProfile.phoneNumber || '',
        bio: doctorProfile.bio || '',
        languages: doctorProfile.languages || [],
        profilePhoto: doctorProfile.profilePhoto || '',
        specialty: doctorProfile.specialty || '',
        licenseNumber: doctorProfile.licenseNumber || '',
        experience: doctorProfile.experience || '',
        medicalDegree: doctorProfile.medicalDegree || '',
        medicalSchool: doctorProfile.medicalSchool || '',
        graduationYear: doctorProfile.graduationYear || '',
        address: {
          street: doctorProfile.address?.street || '',
          city: doctorProfile.address?.city || '',
          state: doctorProfile.address?.state || '',
          zipCode: doctorProfile.address?.zipCode || '',
          country: doctorProfile.address?.country || 'India'
        },
        certifications: doctorProfile.certifications || [],
        hospitalAffiliations: doctorProfile.hospitalAffiliations || [],
        consultationFee: doctorProfile.consultationFee || '',
        consultationDuration: doctorProfile.consultationDuration || 30,
        availabilitySchedule: doctorProfile.availabilitySchedule || {
          monday: { isAvailable: false, startTime: '', endTime: '' },
          tuesday: { isAvailable: false, startTime: '', endTime: '' },
          wednesday: { isAvailable: false, startTime: '', endTime: '' },
          thursday: { isAvailable: false, startTime: '', endTime: '' },
          friday: { isAvailable: false, startTime: '', endTime: '' },
          saturday: { isAvailable: false, startTime: '', endTime: '' },
          sunday: { isAvailable: false, startTime: '', endTime: '' }
        }
      });
    }
  }, [doctorProfile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availabilitySchedule: {
        ...prev.availabilitySchedule,
        [day]: {
          ...prev.availabilitySchedule[day],
          [field]: value
        }
      }
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageToRemove) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuingOrganization && newCertification.issueDate) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification, id: Date.now() }]
      }));
      setNewCertification({
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: ''
      });
    }
  };

  const removeCertification = (certificationId) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== certificationId)
    }));
  };

  const addHospitalAffiliation = () => {
    if (newHospitalAffiliation.hospitalName && newHospitalAffiliation.position && newHospitalAffiliation.startDate) {
      setFormData(prev => ({
        ...prev,
        hospitalAffiliations: [...prev.hospitalAffiliations, { ...newHospitalAffiliation, id: Date.now() }]
      }));
      setNewHospitalAffiliation({
        hospitalName: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false
      });
    }
  };

  const removeHospitalAffiliation = (affiliationId) => {
    setFormData(prev => ({
      ...prev,
      hospitalAffiliations: prev.hospitalAffiliations.filter(affiliation => affiliation.id !== affiliationId)
    }));
  };

const handleSave = async () => {

  

    try {
      setIsLoading(true);
      
      // Validate form data before sending
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: `Please fix the following errors:\n${validationErrors.join('\n')}`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const cleanCertifications = formData.certifications.map(({ id, ...rest }) => rest);
      const cleanAffiliations = formData.hospitalAffiliations.map(({ id, ...rest }) => rest);

      // Prepare data for API call
      const profileData = {
          ...formData,
          certifications: cleanCertifications,
          hospitalAffiliations: cleanAffiliations,
          experience: Number(formData.experience),
          graduationYear: Number(formData.graduationYear),
          consultationFee: Number(formData.consultationFee),
          consultationDuration: Number(formData.consultationDuration),
          updatedAt: new Date().toISOString()
};

      const token = localStorage.getItem('authToken');
      const apiUrl = doctorProfile 
        ? `${baseUrl}/api/doctor/profile/${doctorProfile._id}`
        : `${baseUrl}/api/doctor/profile`;

      // Make API call to save profile data
      const response = await fetch(apiUrl, {
        method: doctorProfile ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const savedData = await response.json();
      
      // Update local state with saved data
      setFormData(savedData);
      setIsEditing(false);
      setIsLoading(false);
      
      // Show success message
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      });
      
      // Refresh the page to get updated data
      // fetchDoctorData()
      window.location.reload();

      
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsLoading(false);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error.name === 'NetworkError' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.message.includes('422')) {
        errorMessage = 'Invalid data. Please check your inputs and try again.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

// Helper function for form validation
const validateFormData = (data) => {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }
    
    if (!data.phoneNumber || !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phoneNumber)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (!data.specialty) {
      errors.push('Please select a specialty');
    }
    
    if (!data.licenseNumber) {
      errors.push('License number is required');
    }
    
    if (!data.experience || data.experience < 0) {
  errors.push('Please enter valid years of experience');
} else if (data.graduationYear) {
  const yearsSinceGraduation = new Date().getFullYear() - data.graduationYear;
  if (data.experience > yearsSinceGraduation) {
    errors.push(`Experience cannot exceed ${yearsSinceGraduation} years since graduation`);
  }
}
    
    if (!data.medicalDegree) {
      errors.push('Please select a medical degree');
    }
    
    if (!data.medicalSchool) {
      errors.push('Medical school is required');
    }
    
    if (!data.graduationYear || data.graduationYear < 1950 || data.graduationYear > new Date().getFullYear()) {
      errors.push('Please enter a valid graduation year');
    }
    
    if (!data.address.street || !data.address.city || !data.address.state || !data.address.zipCode) {
      errors.push('Complete address is required');
    }
    
    return errors;
  };

  const specialtys = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
      'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
      'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
      'Surgery', 'Urology', 'Ophthalmology', 'ENT', 'Anesthesia',
      'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
      'Pathology', 'Pulmonology', 'Rheumatology', 'Nephrology',
      'Hematology', 'Infectious Disease', 'Allergy & Immunology',
      'Physical Medicine', 'Plastic Surgery', 'Preventive Medicine'
  ];

  const medicalDegrees = ['MBBS', 'MD', 'DO', 'BAMS', 'BHMS', 'BDS', 'MDS', 'Other'];

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const currentYear = new Date().getFullYear();

  const isExperienceInvalid = (
    doctorProfile?.experience &&
    doctorProfile?.graduationYear &&
    doctorProfile.experience > (currentYear - doctorProfile.graduationYear)
  );

  if (!isEditing && doctorProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Display Current Profile */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  {doctorProfile.profilePhoto ? (
                    <img src={doctorProfile.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{doctorProfile.fullName}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p className="text-gray-800">{doctorProfile.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Experience</Label>
                  <p className="text-gray-800">{doctorProfile.experience} years</p>
                </div>
              </div>
              {doctorProfile.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bio</Label>
                  <p className="text-gray-800">{doctorProfile.bio}</p>
                </div>
              )}
              {doctorProfile.languages && doctorProfile.languages.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {doctorProfile.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">

        <div>
          <Label className="text-sm font-medium text-gray-600">Specialty</Label>
          <p className="text-gray-800">
            {doctorProfile?.specialty || <span className="text-red-500 italic">Missing</span>}
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">License Number</Label>
          <p className="text-gray-800">
            {doctorProfile?.licenseNumber || <span className="text-red-500 italic">Missing</span>}
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Medical Degree</Label>
          <p className="text-gray-800">
            {doctorProfile?.medicalDegree || <span className="text-red-500 italic">Missing</span>}
          </p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-600">Graduation Year</Label>
          <p className="text-gray-800">
            {doctorProfile?.graduationYear || <span className="text-red-500 italic">Missing</span>}
          </p>
        </div>

      </div>

      <div>
        <Label className="text-sm font-medium text-gray-600">Medical School</Label>
        <p className="text-gray-800">
          {doctorProfile?.medicalSchool || <span className="text-red-500 italic">Missing</span>}
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-600">Years of Experience</Label>
        <p className={`text-gray-800 ${isExperienceInvalid ? 'text-red-600 font-semibold' : ''}`}>
          {doctorProfile?.experience !== undefined
            ? `${doctorProfile.experience} year${doctorProfile.experience === 1 ? '' : 's'}`
            : <span className="text-red-500 italic">Missing</span>}
        </p>
        {isExperienceInvalid && (
          <p className="text-sm text-red-500">
            ⚠ Experience exceeds time since graduation ({currentYear - doctorProfile.graduationYear} years)
          </p>
        )}
      </div>
    </CardContent>
          </Card>
        </div>

        {doctorProfile.address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800">
                {doctorProfile.address.street}, {doctorProfile.address.city}, {doctorProfile.address.state} {doctorProfile.address.zipCode}, {doctorProfile.address.country}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          {doctorProfile ? 'Edit Profile' : 'Complete Your Profile'}
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
 <Button 
    onClick={handleSave}
    disabled={isLoading}
    className="bg-gradient-to-r from-green-500 to-green-600 text-white"
  >
    {isLoading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Saving...
      </>
    ) : (
      <>
        <Save className="h-4 w-4 mr-2" />
        Save Profile
      </>
    )}
  </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div>
            <Label>Languages</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language"
                onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
              />
              <Button type="button" onClick={addLanguage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {lang}
                  <button onClick={() => removeLanguage(lang)} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialty">specialty *</Label>
              <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtys.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="licenseNumber">License Number *</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                placeholder="Enter your license number"
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Enter years of experience"
                min="0"
                max="60"
              />
            </div>
            <div>
              <Label htmlFor="medicalDegree">Medical Degree *</Label>
              <Select value={formData.medicalDegree} onValueChange={(value) => handleInputChange('medicalDegree', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select medical degree" />
                </SelectTrigger>
                <SelectContent>
                  {medicalDegrees.map((degree) => (
                    <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="medicalSchool">Medical School *</Label>
              <Input
                id="medicalSchool"
                value={formData.medicalSchool}
                onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
                placeholder="Enter your medical school"
              />
            </div>
            <div>
              <Label htmlFor="graduationYear">Graduation Year *</Label>
              <Input
                id="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                placeholder="Enter graduation year"
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="Enter street address"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Enter state"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="Enter ZIP code"
              />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Certification name"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({...prev, name: e.target.value}))}
            />
            <Input
              placeholder="Issuing organization"
              value={newCertification.issuingOrganization}
              onChange={(e) => setNewCertification(prev => ({...prev, issuingOrganization: e.target.value}))}
            />
            <Input
              type="date"
              placeholder="Issue date"
              value={newCertification.issueDate}
              onChange={(e) => setNewCertification(prev => ({...prev, issueDate: e.target.value}))}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Expiry date (optional)"
                value={newCertification.expiryDate}
                onChange={(e) => setNewCertification(prev => ({...prev, expiryDate: e.target.value}))}
              />
              <Button type="button" onClick={addCertification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {formData.certifications.map((cert, index) => (
              <div key={cert.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{cert.name}</p>
                  <p className="text-sm text-gray-600">{cert.issuingOrganization} • {cert.issueDate}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id || index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hospital Affiliations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Hospital Affiliations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Hospital name"
              value={newHospitalAffiliation.hospitalName}
              onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, hospitalName: e.target.value}))}
            />
            <Input
              placeholder="Position"
              value={newHospitalAffiliation.position}
              onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, position: e.target.value}))}
            />
            <Input
              type="date"
              placeholder="Start date"
              value={newHospitalAffiliation.startDate}
              onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, startDate: e.target.value}))}
            />
            <Input
              type="date"
              placeholder="End date (optional)"
              value={newHospitalAffiliation.endDate}
              onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, endDate: e.target.value}))}
              disabled={newHospitalAffiliation.isCurrent}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newHospitalAffiliation.isCurrent}
                onCheckedChange={(checked) => setNewHospitalAffiliation(prev => ({...prev, isCurrent: checked}))}
              />
              <Label className="text-sm">Current</Label>
              <Button type="button" onClick={addHospitalAffiliation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            {formData.hospitalAffiliations.map((affiliation, index) => (
              <div key={affiliation.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{affiliation.hospitalName}</p>
                  <p className="text-sm text-gray-600">
                    {affiliation.position} • {affiliation.startDate} - {affiliation.isCurrent ? 'Present' : affiliation.endDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHospitalAffiliation(affiliation.id || index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consultation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Consultation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
              <Input
                id="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                placeholder="Enter consultation fee"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="consultationDuration">Consultation Duration (minutes)</Label>
              <Input
                id="consultationDuration"
                type="number"
                value={formData.consultationDuration}
                onChange={(e) => handleInputChange('consultationDuration', e.target.value)}
                placeholder="Enter duration"
                min="15"
                max="120"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-24">
                <Checkbox
                  checked={formData.availabilitySchedule[day].isAvailable}
                  onCheckedChange={(checked) => handleAvailabilityChange(day, 'isAvailable', checked)}
                />
                <Label className="ml-2 capitalize">{day}</Label>
              </div>
              {formData.availabilitySchedule[day].isAvailable && (
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={formData.availabilitySchedule[day].startTime}
                    onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                    className="w-32"
                  />
                  <span className="self-center">to</span>
                  <Input
                    type="time" 
                    value={formData.availabilitySchedule[day].endTime}
                    onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfileView