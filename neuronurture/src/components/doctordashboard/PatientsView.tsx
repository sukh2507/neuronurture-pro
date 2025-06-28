import React, { useEffect, useState } from 'react';
import { Eye, Loader2, MessageSquare, Plus, UserMinus, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import MotherProfileModal from '@/components/MotherProfileModal'; // adjust path if needed

interface Patient {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  age: number;
  pregnancyStage?: string;
  dueDate?: string;
  currentWeek?: number;
  phone?: string;
  address?: string;
  profilePicture?: string;
  lastVisit?: string;
  joinedDate?: string;
  medicalHistory?: string;
}

interface PatientsViewProps {
  doctorId?: string; // Optional if you get it from context/auth
  patients?: Patient[]; // Optional - if provided, will use these instead of fetching
}

const PatientsView: React.FC<PatientsViewProps> = ({ doctorId, patients: initialPatients }) => {
  const [selectedProfile, setSelectedProfile] = useState<Patient | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(initialPatients || []);
  const [loading, setLoading] = useState(!initialPatients);
  const [error, setError] = useState<string | null>(null);
  const [removingPatientId, setRemovingPatientId] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  // Fetch patients on component mount only if no initial patients provided
  useEffect(() => {
    if (!initialPatients) {
      fetchPatients();
    }
  }, [doctorId, initialPatients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/doctor/patients/${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPatients(data.patients || []);
      } else {
        throw new Error(data.message || 'Failed to fetch patients');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePatient = async (patientId: string) => {
    try {
      setRemovingPatientId(patientId);
      
      const response = await fetch(`/api/doctor/patients/${doctorId}/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove patient: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove patient from local state
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
        setShowRemoveDialog(false);
        setSelectedPatientId(null);
      } else {
        throw new Error(data.message || 'Failed to remove patient');
      }
    } catch (err) {
      console.error('Error removing patient:', err);
      alert(`Failed to remove patient: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setRemovingPatientId(null);
    }
  };

  const handleMessagePatient = (patientId: string) => {
    // Navigate to messaging interface or open chat modal
    // Replace with your routing logic
    window.location.href = `/doctor/messages/${patientId}`;
  };

  const handleViewProfile = (patient: Patient) => {
  setSelectedPatient(patient);
  setIsModalOpen(true);
};


  const handleAddPatient = () => {
    // Navigate to add patient page or open modal
    // Replace with your routing logic
    window.location.href = '/doctor/patients/add';
  };

  const confirmRemove = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowRemoveDialog(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
          <Button disabled className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <Users className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading patients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
          <Button onClick={handleAddPatient} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <Users className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Error loading patients</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchPatients} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
        <Button onClick={handleAddPatient} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

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
                        {patient.pregnancyStage && (
                          <p>Stage: {patient.pregnancyStage}</p>
                        )}
                        {patient.currentWeek && (
                          <p>Week: {patient.currentWeek}</p>
                        )}
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
                      onClick={() => handleMessagePatient(patient.id)}
                      className="hover:bg-green-50 hover:border-green-300"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewProfile(patient)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => confirmRemove(patient.id)}
                      disabled={removingPatientId === patient.id}
                      className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                    >
                      {removingPatientId === patient.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4 mr-2" />
                      )}
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients assigned</h3>
              <p className="text-gray-500 mb-4">Patients will appear here once assigned or added</p>
              <Button onClick={handleAddPatient} className="bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Patient
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Remove Patient Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this patient from your care? This action cannot be undone.
              The patient will no longer have access to your services through this platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPatientId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedPatientId && handleRemovePatient(selectedPatientId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {selectedPatient && (
  <MotherProfileModal
    open={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    patient={selectedPatient}
  />
)}
    </div>
  );
};

export default PatientsView