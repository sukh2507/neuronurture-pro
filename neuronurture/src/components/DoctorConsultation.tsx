import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatModal from '@/components/ChatModal';

const baseUrl = import.meta.env.VITE_BACKEND_PORT;

import { 
  User, 
  MessageSquare, 
  Loader2, 
  AlertCircle, 
  Star, 
  MapPin, 
  Clock, 
  Phone,
  Eye,
  Search,
  Filter,
  Award,
  GraduationCap,
  Stethoscope
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Doctor {
  _id: string;
  fullName: string;
  specialty: string;
  experience: number;
  email: string;
  qualifications: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  about: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  profilePicture: string | null;
  location: string;
  isAvailable: boolean;
}
const DoctorConsultation = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [chatDoctor, setChatDoctor] = useState<Doctor | null>(null);
  const motherId = localStorage.getItem("userId") ?? '';
  
  // Get unique specialties for filter
  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialty]);

  const filterDoctors = () => {
    let filtered = doctors;
    
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }
    
    setFilteredDoctors(filtered);
  };

  const fetchDoctors = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`${baseUrl}/api/doctor/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Doctors data received:', data);
      
      if (Array.isArray(data)) {
        setDoctors(data);
        setFilteredDoctors(data);
      } else {
        console.error('Expected array but got:', data);
        setDoctors([]);
        setFilteredDoctors([]);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Failed to load doctors. Please try again.');
      setDoctors([]);
      setFilteredDoctors([]);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedDoctorId || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a doctor and write a message.",
        variant: "destructive",
      });
      return;
    }

    if (message.trim().length < 10) {
      toast({
        title: "Validation Error", 
        description: "Message must be at least 10 characters long.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem('authToken');
    
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);
      
      const res = await fetch(`${baseUrl}/api/doctor/consult`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          message: message.trim(),
          urgency: urgency
        })
      });

      const responseData = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: "Consultation request sent successfully!",
        });
        setMessage('');
        setSelectedDoctorId(null);
        setUrgency('normal');
      } else {
        throw new Error(responseData.message || 'Failed to send consultation request');
      }
    } catch (error: any) {
      console.error('Error sending consultation:', error);
      toast({
        title: "Error",
        description: error.message || 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Consult a Doctor</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading doctors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Consult a Doctor</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Unable to Load Doctors</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDoctors} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Consult a Doctor</h1>
          <p className="text-gray-600">Connect with verified healthcare professionals</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredDoctors.length} doctors available
        </Badge>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by doctor name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredDoctors.length === 0 ? (
        <div className="text-center py-12">
          <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Doctors Found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedSpecialty 
              ? "Try adjusting your search criteria" 
              : "There are currently no doctors available for consultation."
            }
          </p>
          {(searchTerm || selectedSpecialty) && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
              }} 
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Doctors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor._id}
                className={`border-2 cursor-pointer transition-all duration-200 ${
                  selectedDoctorId === doctor._id 
                    ? 'border-pink-500 bg-pink-50 shadow-lg' 
                    : 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedDoctorId(doctor._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.profilePicture} alt={doctor.fullName} />
                      <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                        {doctor.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">{doctor.fullName}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {doctor.specialty}
                      </Badge>
                      {!doctor.isAvailable && (
                        <Badge variant="destructive" className="ml-2">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  
                  {doctor.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {renderStars(doctor.rating)}
                      </div>
                      <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">
                        ({doctor.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                  
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4" />
                      <span className="truncate">{doctor.qualifications[0].degree}</span>
                    </div>
                  )}
                  
                  {doctor.consultationFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consultation Fee:</span>
                      <span className="font-semibold text-green-600">₹{doctor.consultationFee}</span>
                    </div>
                  )}
                  
                  {doctor.about && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {doctor.about}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
  size="sm"
  variant="outline"
  className="flex-1"
  onClick={(e) => {
  e.stopPropagation();
  setChatDoctor(doctor); // <-- opens the modal
}}
>
  Message
</Button>


                    <Button
                      size="sm"
                      className={`flex-1 ${
                        selectedDoctorId === doctor._id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      disabled={!doctor.isAvailable}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {selectedDoctorId === doctor._id ? 'Selected' : 'Consult'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Consultation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-purple-500" />
                Send Consultation Request
              </CardTitle>
              {selectedDoctorId && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>To:</span>
                  <Badge variant="outline">
                    {filteredDoctors.find(d => d._id === selectedDoctorId)?.fullName}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Urgency Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <div className="flex gap-2">
                  {['low', 'normal', 'high', 'urgent'].map((level) => (
                    <Button
                      key={level}
                      variant={urgency === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUrgency(level)}
                      className={urgency === level ? getUrgencyColor(level) : ''}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <Textarea
                  placeholder="Describe your symptoms, concerns, or questions in detail... (minimum 10 characters)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-sm text-gray-500">
                  <span className={message.length < 10 ? 'text-red-500' : 'text-green-600'}>
                    {message.length}/10 minimum characters
                  </span>
                  {selectedDoctorId && (
                    <div className="mt-1">
                      Priority: <Badge className={getUrgencyColor(urgency)}>{urgency}</Badge>
                    </div>
                  )}
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  onClick={handleSendMessage}
                  disabled={sending || !selectedDoctorId || message.trim().length < 10}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {chatDoctor && (
  <ChatModal
    doctorId={chatDoctor._id}
    doctorName={chatDoctor.fullName}
    motherId={motherId}
    onClose={() => setChatDoctor(null)}
  />
)}

    </div>
  );
};

export default DoctorConsultation;