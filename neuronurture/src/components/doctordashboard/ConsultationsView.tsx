import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Check, Download, FileText, Loader2, MessageSquare, Sparkles, Users, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;


interface ConsultationsViewProps {
  doctorProfile: any;
}

const ConsultationsView = ({ doctorProfile }) => { 
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  const [schedulingModal, setSchedulingModal] = useState({ open: false, consultationId: '', patientName: '' });
  const [selectedTime, setSelectedTime] = useState('');
  const navigate = useNavigate();


  const formatISTDate = (utcDate: string) => {
  if (!utcDate) return null;

  return new Date(utcDate).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!doctorProfile?._id) {
        console.log('No doctor profile ID available');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching consultations for doctor ID:', doctorProfile._id);
        
        const res = await fetch(`${baseUrl}/api/consultation/doctor/${doctorProfile._id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        const data = await res.json();
        console.log('Consultations data received:', data);
        setConsultations(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching consultations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [doctorProfile?._id, token]);

const handleApproval = async (id, approve) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No auth token found');

    console.log('🔁 Approving consultation ID:', id);
    console.log('✅ isApproved value:', approve);

    const res = await fetch(`${baseUrl}/api/consultation/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isApproved: approve })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Approval failed: ${errorText}`);
    }

    const updatedConsultation = await res.json();
    console.log('📝 Consultation after approval:', updatedConsultation);

    // ⬇ Add patient only if approved
    if (approve && doctorProfile?._id && updatedConsultation?.userId) {
      // updatedConsultation.userId is already the User._id we need
      console.log('👤 User ID to add as patient:', updatedConsultation.userId);
      console.log('🏥 Target doctorProfile._id:', doctorProfile._id);

      const addPatientRes = await fetch(`${baseUrl}/api/doctor/profile/${doctorProfile._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientUserId: updatedConsultation.userId // This is already User._id
        })
      });

      const result = await addPatientRes.json();
      console.log('📬 Response from add patient API:', result);

      if (!addPatientRes.ok) {
        console.error('❌ Failed to add patient:', result);
      } else {
        console.log('✅ Patient added successfully!');
        window.location.reload();
      }
    } else {
      console.warn('⚠️ Missing doctorProfile or patientUserId. Skipping patient add.');
    }

    setConsultations(prev =>
      prev.map(c => c._id === id ? updatedConsultation : c)
    );

    toast({
      title: "Success",
      description: `Consultation ${approve ? 'approved and patient added' : 'rejected'} successfully.`,
    });

  } catch (err) {
    console.error('🔥 Error in approval:', err);

    toast({
      title: "Error",
      description: "Failed to update consultation. Check console.",
      variant: "destructive",
    });
  }
};




  const handleSchedule = async () => {
  if (!selectedTime) return;

  try {
    const res = await fetch(`${baseUrl}/api/consultation/${schedulingModal.consultationId}/schedule`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preferredTime: selectedTime }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const updated = await res.json();
    setConsultations(prev =>
      prev.map(c => c._id === updated._id ? updated : c)
    );

    toast({
      title: "Scheduled",
      description: `Consultation with ${schedulingModal.patientName} scheduled.`,
    });

    setSchedulingModal({ open: false, consultationId: '', patientName: '' });
    setSelectedTime('');
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to schedule consultation",
      variant: "destructive",
    });
  }
};


  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading consultations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Error Loading Consultations</h3>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
        <div className="text-sm text-gray-600">
          {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {consultations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No consultation requests yet</h3>
            <p className="text-gray-500">Patient consultation requests will appear here</p>
            <div className="mt-4 text-xs text-gray-400">
              Doctor Profile ID: {doctorProfile?._id || 'Not available'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map(consult => (
            <Card key={consult._id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{consult.patientName}</h3>
                      <Badge 
                        variant={consult.urgency === 'high' ? 'destructive' : 
                                consult.urgency === 'medium' ? 'default' : 'secondary'}
                      >
                        {consult.urgency} priority
                      </Badge>
                      {/* {consult.isApproved !== null && (
                        <Badge variant={consult.isApproved ? 'default' : 'destructive'}>
                          {consult.isApproved ? 'Approved' : 'Rejected'}
                        </Badge>
                      )} */}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Message:</span>
                        <p className="text-gray-600 mt-1">{consult.message}</p>
                      </div>
                      
                      <div className="text-sm text-gray-500 flex items-center justify-between">
  <div>
    <span className="font-medium">Requested by:</span>{' '}
    {consult.patientName || 'Unknown'}
  </div>

  {consult.patientId && (
  <Button
  size="sm"
  variant="outline"
  onClick={() => navigate(`/doctor/mother/${consult.patientId}`)}
  className='bg-green-500 hover:bg-green-600 text-white'
>
  View Profile
</Button>

)}

</div>

                      
                      {consult.updatedAt && consult.updatedAt !== consult.requestedAt && (
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Last Updated:</span> {' '}
                          {new Date(consult.updatedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {consult.isApproved ? (
  <Button
    onClick={() =>
      setSchedulingModal({
        open: true,
        consultationId: consult._id,
        patientName: consult.patientName
      })
    }
    size="sm"
    className="bg-blue-600 text-white"
  >
    <Calendar className="h-4 w-4 mr-1" />
    Schedule Consultation
  </Button>
) : (
  <Button
    onClick={() => handleApproval(consult._id, true)}
    size="sm"
    className="bg-green-500 hover:bg-green-600 text-white"
  >
    <Check className="h-4 w-4 mr-1" />
    Approve
  </Button>
)}
                    <Button
                      onClick={() => handleApproval(consult._id, false)}
                      disabled={consult.isApproved === false}
                      size="sm"
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>

                  
                </div>
                <div className="mt-2">
    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
      Currently scheduled for: {formatISTDate(consult.preferredTime)}
    </span>
  </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    {schedulingModal.open && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">
        Schedule Consultation with {schedulingModal.patientName}
      </h2>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Date & Time
      </label>
      <input
        type="datetime-local"
        className="w-full border rounded p-2 mb-4"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setSchedulingModal({ open: false, consultationId: '', patientName: '' })}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSchedule}
          className="bg-blue-600 text-white"
        >
          Save Schedule
        </Button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};


const MessagesView = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages</h3>
          <p className="text-gray-500">Patient messages will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
};

interface Patient {
  id: string;
  fullName: string;
  email: string;
  age: number;
  pregnancyStage?: string;
  currentWeek?: number;
  dueDate?: string;
  lastVisit?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  joinedDate?: string;
}
const ReportsView: React.FC<{ doctorId: string }> = ({ doctorId }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch patients from same endpoint as PatientsView
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/doctor/patients/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPatients(data.patients || []);
      } else {
        console.warn('⚠️ No patients found:', data.message);
        setPatients([]); // safe fallback
      }
    } catch (err) {
      console.error('❌ Error fetching patients:', err);
      setPatients([]); // fallback: show no patients
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  const handleGenerateReport = (patientId: string) => {
    // TODO: connect to your AI or backend report generation logic
    alert(`Generating report for patient ID: ${patientId}`);
  };

  const handleDownloadReport = (patientId: string) => {
    // TODO: hook into backend API or static file
    alert(`Downloading report for patient ID: ${patientId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading patients...</span>
        </div>
      ) : (
        <div className="grid gap-6">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{patient.fullName}</h3>
                        <div className="text-gray-600 space-y-1">
                          <p>Age: {patient.age} years</p>
                          {patient.pregnancyStage && <p>Stage: {patient.pregnancyStage}</p>}
                          {patient.currentWeek && <p>Week: {patient.currentWeek}</p>}
                          {patient.dueDate && (
                            <p className="text-sm">Due: {new Date(patient.dueDate).toLocaleDateString()}</p>
                          )}
                          {patient.lastVisit && (
                            <p className="text-sm">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReport(patient.id)}
                        className="hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(patient.id)}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients found</h3>
                <p className="text-gray-500">Patients will appear here once assigned to you.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationsView;