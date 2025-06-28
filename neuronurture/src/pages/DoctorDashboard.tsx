// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Users, Calendar, MessageSquare, FileText,Download, Sparkles, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/hooks/use-toast';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Badge } from '@/components/ui/badge';
// import MotherProfileModal from '@/components/MotherProfileModal';


// import { 
//   User, 
//   Phone, 
//   MapPin, 
//   GraduationCap, 
//   Award, 
//   Building, 
//   DollarSign,
//   Plus,
//   Save,
//   Edit,
//   Camera,
//   Trash2,
//   Check
// } from 'lucide-react';

// import {  
//   UserMinus, 
//   Eye,
//   Loader2,
//   AlertCircle
// } from 'lucide-react';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';

// const DoctorDashboard = () => {
//   const [user, setUser] = useState<any>(null);
//   const [doctorProfile, setDoctorProfile] = useState<any>(null);
//   const [patients, setPatients] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     const token = localStorage.getItem('authToken');
    
//     if (!storedUser || !token) {
//       navigate('/auth');
//       return;
//     }
    
//     const userData = JSON.parse(storedUser);
//     if (userData.role !== 'doctor') {
//       navigate('/dashboard');
//       return;
//     }
    
//     setUser(userData);
//     fetchDoctorData(userData.id, token);
//   }, [navigate]);

//   const fetchDoctorData = async (userId: string, token: string) => {
//     try {
//       // First, find the doctor profile by userId
//       const profileResponse = await fetch(`${baseUrl}/api/doctor/profile/user/${userId}`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (profileResponse.ok) {
//         const profileData = await profileResponse.json();
//         setDoctorProfile(profileData);
        
//         // Then fetch patients using the doctor profile ID
//         const patientsResponse = await fetch(`${baseUrl}/api/doctor/patients/${profileData._id}`, {
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
        
//         if (patientsResponse.ok) {
//           const patientsData = await patientsResponse.json();
//           setPatients(patientsData.patients || []); // ✅ FIXED!
//         }
//       } else {
//         // Doctor profile doesn't exist yet
//         console.log('Doctor profile not found, needs to be created');
//         setLoading(false);
//       }
//     } catch (error) {
//       console.error('Error fetching doctor data:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load doctor data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     navigate('/');
//   };

//   const menuItems = [
//     { id: 'overview', label: 'Overview', icon: Users },
//     { id: 'patients', label: 'My Patients', icon: Users },
//     { id: 'consultations', label: 'Consultations', icon: Calendar },
//     { id: 'messages', label: 'Messages', icon: MessageSquare },
//     { id: 'reports', label: 'Reports', icon: FileText },
//     { id: 'profile', label: 'Profile', icon: Settings },
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'patients':
//         return <PatientsView patients={patients} />;
//       case 'consultations':
//         return <ConsultationsView doctorProfile={doctorProfile} />;
//       case 'messages':
//         return <MessagesView />;
//       case 'reports':
//          return <ReportsView doctorId={doctorProfile._id} />;
//       case 'profile':
//         return <DoctorProfileView doctorProfile={doctorProfile} user={user} />;
//       default:
//         return <DoctorOverview patients={patients} doctorProfile={doctorProfile} loading={loading} />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white shadow-sm border-b border-blue-100 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
//               <Users className="h-6 w-6 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//               Doctor Portal
//             </span>
//           </div>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//           >
//             {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//           </Button>
//         </div>
//       </div>

//       <div className="flex">
//         {/* Sidebar */}
//         <div className={`
//           fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-blue-100 z-50 transform transition-transform duration-300 ease-in-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//         `}>
//           <div className="p-6 border-b border-blue-100">
//             <div className="flex items-center gap-2">
//               <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
//                 <Users className="h-6 w-6 text-white" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Doctor Portal
//               </span>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">
//               Dr. {doctorProfile?.fullName || user?.email || 'Loading...'}
//             </p>
//           </div>

//           <nav className="p-4 space-y-2">
//             {menuItems.map((item) => (
//               <Button
//                 key={item.id}
//                 variant={activeTab === item.id ? "default" : "ghost"}
//                 className={`w-full justify-start ${
//                   activeTab === item.id 
//                     ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
//                     : 'text-gray-700 hover:bg-blue-50'
//                 }`}
//                 onClick={() => {
//                   setActiveTab(item.id);
//                   setSidebarOpen(false);
//                 }}
//               >
//                 <item.icon className="h-4 w-4 mr-2" />
//                 {item.label}
//               </Button>
//             ))}
//           </nav>

//           <div className="absolute bottom-4 left-4 right-4">
//             <Button
//               variant="outline"
//               className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
//               onClick={handleLogout}
//             >
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
        
//         <main className="flex-1 p-4 lg:p-8 lg:ml-64">
//           {renderContent()}
//         </main>
//       </div>
//     </div>
//   );
// };

// const DoctorOverview = ({ patients, doctorProfile, loading }: any) => {
//   if (loading) {
//     return <div className="text-center">Loading...</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">
//             Welcome, Dr. {doctorProfile?.fullName || 'Doctor'}
//           </h1>
//           <p className="text-gray-600">{doctorProfile?.specialty || 'Specialist'}</p>
//         </div>
//         <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//           <Calendar className="h-4 w-4 mr-2" />
//           Schedule Consultation
//         </Button>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-blue-100">Total Patients</p>
//                 <p className="text-3xl font-bold">{patients?.length || 0}</p>
//               </div>
//               <Users className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-indigo-100">Today's Appointments</p>
//                 <p className="text-3xl font-bold">0</p>
//               </div>
//               <Calendar className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100">Pending Reports</p>
//                 <p className="text-3xl font-bold">0</p>
//               </div>
//               <FileText className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-pink-100">Experience</p>
//                 <p className="text-3xl font-bold">{doctorProfile?.experience || 0}y</p>
//               </div>
//               <Clock className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Patients</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {patients?.slice(0, 5).map((patient: any, index: number) => (
//                 <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
//                   <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
//                     <Users className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium">{patient.fullName}</p>
//                     <p className="text-sm text-gray-600">Last visit: 2 days ago</p>
//                   </div>
//                 </div>
//               )) || (
//                 <p className="text-gray-500 text-center">No patients assigned yet</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Today's Schedule</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
//                 <Clock className="h-5 w-5 text-green-500" />
//                 <div>
//                   <p className="font-medium">Sarah Johnson - Consultation</p>
//                   <p className="text-sm text-gray-600">10:00 AM - 10:30 AM</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
//                 <Clock className="h-5 w-5 text-yellow-500" />
//                 <div>
//                   <p className="font-medium">Emma Wilson - Follow-up</p>
//                   <p className="text-sm text-gray-600">2:00 PM - 2:30 PM</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
//                 <Clock className="h-5 w-5 text-blue-500" />
//                 <div>
//                   <p className="font-medium">Michael Brown - Screening Review</p>
//                   <p className="text-sm text-gray-600">4:00 PM - 4:30 PM</p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// interface Patient {
//   id: string;
//   userId: string;
//   fullName: string;
//   email: string;
//   age: number;
//   pregnancyStage?: string;
//   dueDate?: string;
//   currentWeek?: number;
//   phone?: string;
//   address?: string;
//   profilePicture?: string;
//   lastVisit?: string;
//   joinedDate?: string;
//   medicalHistory?: string;
// }

// interface PatientsViewProps {
//   doctorId?: string; // Optional if you get it from context/auth
//   patients?: Patient[]; // Optional - if provided, will use these instead of fetching
// }

// const PatientsView: React.FC<PatientsViewProps> = ({ doctorId, patients: initialPatients }) => {
//   const [selectedProfile, setSelectedProfile] = useState<Patient | null>(null);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [patients, setPatients] = useState<Patient[]>(initialPatients || []);
//   const [loading, setLoading] = useState(!initialPatients);
//   const [error, setError] = useState<string | null>(null);
//   const [removingPatientId, setRemovingPatientId] = useState<string | null>(null);
//   const [showRemoveDialog, setShowRemoveDialog] = useState(false);
//   const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
//   // Fetch patients on component mount only if no initial patients provided
//   useEffect(() => {
//     if (!initialPatients) {
//       fetchPatients();
//     }
//   }, [doctorId, initialPatients]);

//   const fetchPatients = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await fetch(`/api/doctor/patients/${doctorId}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch patients: ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setPatients(data.patients || []);
//       } else {
//         throw new Error(data.message || 'Failed to fetch patients');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch patients');
//       console.error('Error fetching patients:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemovePatient = async (patientId: string) => {
//     try {
//       setRemovingPatientId(patientId);
      
//       const response = await fetch(`/api/doctor/patients/${doctorId}/${patientId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to remove patient: ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         // Remove patient from local state
//         setPatients(prev => prev.filter(patient => patient.id !== patientId));
//         setShowRemoveDialog(false);
//         setSelectedPatientId(null);
//       } else {
//         throw new Error(data.message || 'Failed to remove patient');
//       }
//     } catch (err) {
//       console.error('Error removing patient:', err);
//       alert(`Failed to remove patient: ${err instanceof Error ? err.message : 'Unknown error'}`);
//     } finally {
//       setRemovingPatientId(null);
//     }
//   };

//   const handleMessagePatient = (patientId: string) => {
//     // Navigate to messaging interface or open chat modal
//     // Replace with your routing logic
//     window.location.href = `/doctor/messages/${patientId}`;
//   };

//   const handleViewProfile = (patient: Patient) => {
//   setSelectedPatient(patient);
//   setIsModalOpen(true);
// };


//   const handleAddPatient = () => {
//     // Navigate to add patient page or open modal
//     // Replace with your routing logic
//     window.location.href = '/doctor/patients/add';
//   };

//   const confirmRemove = (patientId: string) => {
//     setSelectedPatientId(patientId);
//     setShowRemoveDialog(true);
//   };

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
//           <Button disabled className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//             <Users className="h-4 w-4 mr-2" />
//             Add Patient
//           </Button>
//         </div>
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           <span className="ml-2 text-gray-600">Loading patients...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
//           <Button onClick={handleAddPatient} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//             <Users className="h-4 w-4 mr-2" />
//             Add Patient
//           </Button>
//         </div>
//         <Card>
//           <CardContent className="p-12 text-center">
//             <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">Error loading patients</h3>
//             <p className="text-gray-500 mb-4">{error}</p>
//             <Button onClick={fetchPatients} variant="outline">
//               Try Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
//         <Button onClick={handleAddPatient} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
//           <Plus className="h-4 w-4 mr-2" />
//           Add Patient
//         </Button>
//       </div>

//       <div className="grid gap-6">
//         {patients.length > 0 ? (
//           patients.map((patient) => (
//             <Card key={patient.id} className="hover:shadow-lg transition-shadow">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
//                       <Users className="h-6 w-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800">{patient.fullName}</h3>
//                       <div className="text-gray-600 space-y-1">
//                         <p>Age: {patient.age} years</p>
//                         {patient.pregnancyStage && (
//                           <p>Stage: {patient.pregnancyStage}</p>
//                         )}
//                         {patient.currentWeek && (
//                           <p>Week: {patient.currentWeek}</p>
//                         )}
//                         {patient.dueDate && (
//                           <p className="text-sm">Due: {new Date(patient.dueDate).toLocaleDateString()}</p>
//                         )}
//                         {patient.lastVisit && (
//                           <p className="text-sm">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 flex-wrap">
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => handleMessagePatient(patient.id)}
//                       className="hover:bg-green-50 hover:border-green-300"
//                     >
//                       <MessageSquare className="h-4 w-4 mr-2" />
//                       Message
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => handleViewProfile(patient)}
//                       className="hover:bg-blue-50 hover:border-blue-300"
//                     >
//                       <Eye className="h-4 w-4 mr-2" />
//                       View Profile
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => confirmRemove(patient.id)}
//                       disabled={removingPatientId === patient.id}
//                       className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
//                     >
//                       {removingPatientId === patient.id ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         <UserMinus className="h-4 w-4 mr-2" />
//                       )}
//                       Remove
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card>
//             <CardContent className="p-12 text-center">
//               <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients assigned</h3>
//               <p className="text-gray-500 mb-4">Patients will appear here once assigned or added</p>
//               <Button onClick={handleAddPatient} className="bg-blue-600 text-white">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Your First Patient
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Remove Patient Confirmation Dialog */}
//       <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Remove Patient</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to remove this patient from your care? This action cannot be undone.
//               The patient will no longer have access to your services through this platform.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel onClick={() => setSelectedPatientId(null)}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={() => selectedPatientId && handleRemovePatient(selectedPatientId)}
//               className="bg-red-600 hover:bg-red-700"
//             >
//               Remove Patient
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//       {selectedPatient && (
//   <MotherProfileModal
//     open={isModalOpen}
//     onClose={() => setIsModalOpen(false)}
//     patient={selectedPatient}
//   />
// )}
//     </div>
//   );
// };




// interface ConsultationsViewProps {
//   doctorProfile: any;
// }

// const ConsultationsView = ({ doctorProfile }) => { 
//   const [consultations, setConsultations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const token = localStorage.getItem('authToken');
//   const [schedulingModal, setSchedulingModal] = useState({ open: false, consultationId: '', patientName: '' });
//   const [selectedTime, setSelectedTime] = useState('');
//   const navigate = useNavigate();


//   const formatISTDate = (utcDate: string) => {
//   if (!utcDate) return null;

//   return new Date(utcDate).toLocaleString('en-IN', {
//     timeZone: 'Asia/Kolkata',
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//     hour: 'numeric',
//     minute: '2-digit',
//     hour12: true,
//   });
// };

//   useEffect(() => {
//     const fetchConsultations = async () => {
//       if (!doctorProfile?._id) {
//         console.log('No doctor profile ID available');
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log('Fetching consultations for doctor ID:', doctorProfile._id);
        
//         const res = await fetch(`${baseUrl}/api/consultation/doctor/${doctorProfile._id}`, {
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         console.log('Response status:', res.status);
        
//         if (!res.ok) {
//           const errorText = await res.text();
//           console.error('API Error:', errorText);
//           throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
//         }

//         const data = await res.json();
//         console.log('Consultations data received:', data);
//         setConsultations(data);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching consultations:', err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConsultations();
//   }, [doctorProfile?._id, token]);

// const handleApproval = async (id, approve) => {
//   try {
//     const token = localStorage.getItem('authToken');
//     if (!token) throw new Error('No auth token found');

//     console.log('🔁 Approving consultation ID:', id);
//     console.log('✅ isApproved value:', approve);

//     const res = await fetch(`${baseUrl}/api/consultation/${id}`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ isApproved: approve })
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       throw new Error(`Approval failed: ${errorText}`);
//     }

//     const updatedConsultation = await res.json();
//     console.log('📝 Consultation after approval:', updatedConsultation);

//     // ⬇ Add patient only if approved
//     if (approve && doctorProfile?._id && updatedConsultation?.userId) {
//       // updatedConsultation.userId is already the User._id we need
//       console.log('👤 User ID to add as patient:', updatedConsultation.userId);
//       console.log('🏥 Target doctorProfile._id:', doctorProfile._id);

//       const addPatientRes = await fetch(`${baseUrl}/api/doctor/profile/${doctorProfile._id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           patientUserId: updatedConsultation.userId // This is already User._id
//         })
//       });

//       const result = await addPatientRes.json();
//       console.log('📬 Response from add patient API:', result);

//       if (!addPatientRes.ok) {
//         console.error('❌ Failed to add patient:', result);
//       } else {
//         console.log('✅ Patient added successfully!');
//         window.location.reload();
//       }
//     } else {
//       console.warn('⚠️ Missing doctorProfile or patientUserId. Skipping patient add.');
//     }

//     setConsultations(prev =>
//       prev.map(c => c._id === id ? updatedConsultation : c)
//     );

//     toast({
//       title: "Success",
//       description: `Consultation ${approve ? 'approved and patient added' : 'rejected'} successfully.`,
//     });

//   } catch (err) {
//     console.error('🔥 Error in approval:', err);

//     toast({
//       title: "Error",
//       description: "Failed to update consultation. Check console.",
//       variant: "destructive",
//     });
//   }
// };




//   const handleSchedule = async () => {
//   if (!selectedTime) return;

//   try {
//     const res = await fetch(`${baseUrl}/api/consultation/${schedulingModal.consultationId}/schedule`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ preferredTime: selectedTime }),
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const updated = await res.json();
//     setConsultations(prev =>
//       prev.map(c => c._id === updated._id ? updated : c)
//     );

//     toast({
//       title: "Scheduled",
//       description: `Consultation with ${schedulingModal.patientName} scheduled.`,
//     });

//     setSchedulingModal({ open: false, consultationId: '', patientName: '' });
//     setSelectedTime('');
//   } catch (err) {
//     toast({
//       title: "Error",
//       description: "Failed to schedule consultation",
//       variant: "destructive",
//     });
//   }
// };


//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
//         <div className="flex items-center justify-center p-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <span className="ml-2">Loading consultations...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
//         <Card>
//           <CardContent className="p-8 text-center">
//             <div className="text-red-500 mb-4">
//               <MessageSquare className="h-12 w-12 mx-auto mb-2" />
//               <h3 className="text-lg font-semibold">Error Loading Consultations</h3>
//               <p className="text-sm mt-2">{error}</p>
//             </div>
//             <Button 
//               onClick={() => window.location.reload()} 
//               className="bg-blue-500 text-white"
//             >
//               Retry
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">Consultations</h1>
//         <div className="text-sm text-gray-600">
//           {consultations.length} consultation{consultations.length !== 1 ? 's' : ''} found
//         </div>
//       </div>

//       {consultations.length === 0 ? (
//         <Card>
//           <CardContent className="p-12 text-center">
//             <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-600 mb-2">No consultation requests yet</h3>
//             <p className="text-gray-500">Patient consultation requests will appear here</p>
//             <div className="mt-4 text-xs text-gray-400">
//               Doctor Profile ID: {doctorProfile?._id || 'Not available'}
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {consultations.map(consult => (
//             <Card key={consult._id} className="border-l-4 border-l-blue-500">
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <h3 className="text-lg font-semibold">{consult.patientName}</h3>
//                       <Badge 
//                         variant={consult.urgency === 'high' ? 'destructive' : 
//                                 consult.urgency === 'medium' ? 'default' : 'secondary'}
//                       >
//                         {consult.urgency} priority
//                       </Badge>
//                       {/* {consult.isApproved !== null && (
//                         <Badge variant={consult.isApproved ? 'default' : 'destructive'}>
//                           {consult.isApproved ? 'Approved' : 'Rejected'}
//                         </Badge>
//                       )} */}
//                     </div>
                    
//                     <div className="space-y-2">
//                       <div>
//                         <span className="font-medium text-gray-700">Message:</span>
//                         <p className="text-gray-600 mt-1">{consult.message}</p>
//                       </div>
                      
//                       <div className="text-sm text-gray-500 flex items-center justify-between">
//   <div>
//     <span className="font-medium">Requested by:</span>{' '}
//     {consult.patientName || 'Unknown'}
//   </div>

//   {consult.patientId && (
//   <Button
//   size="sm"
//   variant="outline"
//   onClick={() => navigate(`/doctor/mother/${consult.patientId}`)}
//   className='bg-green-500 hover:bg-green-600 text-white'
// >
//   View Profile
// </Button>

// )}

// </div>

                      
//                       {consult.updatedAt && consult.updatedAt !== consult.requestedAt && (
//                         <div className="text-sm text-gray-500">
//                           <span className="font-medium">Last Updated:</span> {' '}
//                           {new Date(consult.updatedAt).toLocaleString()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="flex gap-2 ml-4">
//                     {consult.isApproved ? (
//   <Button
//     onClick={() =>
//       setSchedulingModal({
//         open: true,
//         consultationId: consult._id,
//         patientName: consult.patientName
//       })
//     }
//     size="sm"
//     className="bg-blue-600 text-white"
//   >
//     <Calendar className="h-4 w-4 mr-1" />
//     Schedule Consultation
//   </Button>
// ) : (
//   <Button
//     onClick={() => handleApproval(consult._id, true)}
//     size="sm"
//     className="bg-green-500 hover:bg-green-600 text-white"
//   >
//     <Check className="h-4 w-4 mr-1" />
//     Approve
//   </Button>
// )}
//                     <Button
//                       onClick={() => handleApproval(consult._id, false)}
//                       disabled={consult.isApproved === false}
//                       size="sm"
//                       variant="destructive"
//                     >
//                       <X className="h-4 w-4 mr-1" />
//                       Reject
//                     </Button>
//                   </div>

                  
//                 </div>
//                 <div className="mt-2">
//     <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
//       Currently scheduled for: {formatISTDate(consult.preferredTime)}
//     </span>
//   </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}

//     {schedulingModal.open && (
//   <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
//     <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full">
//       <h2 className="text-xl font-semibold mb-4">
//         Schedule Consultation with {schedulingModal.patientName}
//       </h2>

//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         Select Date & Time
//       </label>
//       <input
//         type="datetime-local"
//         className="w-full border rounded p-2 mb-4"
//         value={selectedTime}
//         onChange={(e) => setSelectedTime(e.target.value)}
//       />

//       <div className="flex justify-end gap-2">
//         <Button
//           variant="outline"
//           onClick={() => setSchedulingModal({ open: false, consultationId: '', patientName: '' })}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSchedule}
//           className="bg-blue-600 text-white"
//         >
//           Save Schedule
//         </Button>
//       </div>
//     </div>
//   </div>
// )}


//     </div>
//   );
// };


// const MessagesView = () => {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
//       <Card>
//         <CardContent className="p-12 text-center">
//           <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-600 mb-2">No messages</h3>
//           <p className="text-gray-500">Patient messages will appear here</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// interface Patient {
//   id: string;
//   fullName: string;
//   email: string;
//   age: number;
//   pregnancyStage?: string;
//   currentWeek?: number;
//   dueDate?: string;
//   lastVisit?: string;
//   phone?: string;
//   address?: string;
//   medicalHistory?: string;
//   joinedDate?: string;
// }
// const ReportsView: React.FC<{ doctorId: string }> = ({ doctorId }) => {
//   const [patients, setPatients] = useState<Patient[]>([]);
//   const [loading, setLoading] = useState(true);

//   // ✅ Fetch patients from same endpoint as PatientsView
//   const fetchPatients = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${baseUrl}/api/doctor/patients/${doctorId}`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
//           'Content-Type': 'application/json'
//         },
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         setPatients(data.patients || []);
//       } else {
//         console.warn('⚠️ No patients found:', data.message);
//         setPatients([]); // safe fallback
//       }
//     } catch (err) {
//       console.error('❌ Error fetching patients:', err);
//       setPatients([]); // fallback: show no patients
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPatients();
//   }, [doctorId]);

//   const handleGenerateReport = (patientId: string) => {
//     // TODO: connect to your AI or backend report generation logic
//     alert(`Generating report for patient ID: ${patientId}`);
//   };

//   const handleDownloadReport = (patientId: string) => {
//     // TODO: hook into backend API or static file
//     alert(`Downloading report for patient ID: ${patientId}`);
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
//           <span className="ml-2 text-gray-600">Loading patients...</span>
//         </div>
//       ) : (
//         <div className="grid gap-6">
//           {patients.length > 0 ? (
//             patients.map((patient) => (
//               <Card key={patient.id} className="hover:shadow-lg transition-shadow">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
//                         <Users className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800">{patient.fullName}</h3>
//                         <div className="text-gray-600 space-y-1">
//                           <p>Age: {patient.age} years</p>
//                           {patient.pregnancyStage && <p>Stage: {patient.pregnancyStage}</p>}
//                           {patient.currentWeek && <p>Week: {patient.currentWeek}</p>}
//                           {patient.dueDate && (
//                             <p className="text-sm">Due: {new Date(patient.dueDate).toLocaleDateString()}</p>
//                           )}
//                           {patient.lastVisit && (
//                             <p className="text-sm">Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex gap-2 flex-wrap">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleGenerateReport(patient.id)}
//                         className="hover:bg-indigo-50 hover:border-indigo-300"
//                       >
//                         <Sparkles className="h-4 w-4 mr-2" />
//                         Generate Report
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleDownloadReport(patient.id)}
//                         className="hover:bg-green-50 hover:border-green-300"
//                       >
//                         <Download className="h-4 w-4 mr-2" />
//                         Download Report
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           ) : (
//             <Card>
//               <CardContent className="p-12 text-center">
//                 <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-600 mb-2">No patients found</h3>
//                 <p className="text-gray-500">Patients will appear here once assigned to you.</p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const DoctorProfileView = ({ doctorProfile, user }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     // Personal Information
//     fullName: '',
//     phoneNumber: '',
//     bio: '',
//     languages: [],
//     profilePhoto: '',
    
//     // Professional Information
//     specialty: '',
//     licenseNumber: '',
//     experience: '',
//     medicalDegree: '',
//     medicalSchool: '',
//     graduationYear: '',
    
//     // Contact Information
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       zipCode: '',
//       country: 'India'
//     },
    
//     // Certifications
//     certifications: [],
    
//     // Hospital Affiliations
//     hospitalAffiliations: [],
    
//     // Consultation Settings
//     consultationFee: '',
//     consultationDuration: 30,
//     availabilitySchedule: {
//       monday: { isAvailable: false, startTime: '', endTime: '' },
//       tuesday: { isAvailable: false, startTime: '', endTime: '' },
//       wednesday: { isAvailable: false, startTime: '', endTime: '' },
//       thursday: { isAvailable: false, startTime: '', endTime: '' },
//       friday: { isAvailable: false, startTime: '', endTime: '' },
//       saturday: { isAvailable: false, startTime: '', endTime: '' },
//       sunday: { isAvailable: false, startTime: '', endTime: '' }
//     }
//   });

//   const [newLanguage, setNewLanguage] = useState('');
//   const [newCertification, setNewCertification] = useState({
//     name: '',
//     issuingOrganization: '',
//     issueDate: '',
//     expiryDate: ''
//   });
//   const [newHospitalAffiliation, setNewHospitalAffiliation] = useState({
//     hospitalName: '',
//     position: '',
//     startDate: '',
//     endDate: '',
//     isCurrent: false
//   });

//   // Populate form data when doctorProfile changes
//   useEffect(() => {
//     if (doctorProfile) {
//       setFormData({
//         fullName: doctorProfile.fullName || '',
//         phoneNumber: doctorProfile.phoneNumber || '',
//         bio: doctorProfile.bio || '',
//         languages: doctorProfile.languages || [],
//         profilePhoto: doctorProfile.profilePhoto || '',
//         specialty: doctorProfile.specialty || '',
//         licenseNumber: doctorProfile.licenseNumber || '',
//         experience: doctorProfile.experience || '',
//         medicalDegree: doctorProfile.medicalDegree || '',
//         medicalSchool: doctorProfile.medicalSchool || '',
//         graduationYear: doctorProfile.graduationYear || '',
//         address: {
//           street: doctorProfile.address?.street || '',
//           city: doctorProfile.address?.city || '',
//           state: doctorProfile.address?.state || '',
//           zipCode: doctorProfile.address?.zipCode || '',
//           country: doctorProfile.address?.country || 'India'
//         },
//         certifications: doctorProfile.certifications || [],
//         hospitalAffiliations: doctorProfile.hospitalAffiliations || [],
//         consultationFee: doctorProfile.consultationFee || '',
//         consultationDuration: doctorProfile.consultationDuration || 30,
//         availabilitySchedule: doctorProfile.availabilitySchedule || {
//           monday: { isAvailable: false, startTime: '', endTime: '' },
//           tuesday: { isAvailable: false, startTime: '', endTime: '' },
//           wednesday: { isAvailable: false, startTime: '', endTime: '' },
//           thursday: { isAvailable: false, startTime: '', endTime: '' },
//           friday: { isAvailable: false, startTime: '', endTime: '' },
//           saturday: { isAvailable: false, startTime: '', endTime: '' },
//           sunday: { isAvailable: false, startTime: '', endTime: '' }
//         }
//       });
//     }
//   }, [doctorProfile]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleAddressChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       address: {
//         ...prev.address,
//         [field]: value
//       }
//     }));
//   };

//   const handleAvailabilityChange = (day, field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       availabilitySchedule: {
//         ...prev.availabilitySchedule,
//         [day]: {
//           ...prev.availabilitySchedule[day],
//           [field]: value
//         }
//       }
//     }));
//   };

//   const addLanguage = () => {
//     if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         languages: [...prev.languages, newLanguage.trim()]
//       }));
//       setNewLanguage('');
//     }
//   };

//   const removeLanguage = (languageToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       languages: prev.languages.filter(lang => lang !== languageToRemove)
//     }));
//   };

//   const addCertification = () => {
//     if (newCertification.name && newCertification.issuingOrganization && newCertification.issueDate) {
//       setFormData(prev => ({
//         ...prev,
//         certifications: [...prev.certifications, { ...newCertification, id: Date.now() }]
//       }));
//       setNewCertification({
//         name: '',
//         issuingOrganization: '',
//         issueDate: '',
//         expiryDate: ''
//       });
//     }
//   };

//   const removeCertification = (certificationId) => {
//     setFormData(prev => ({
//       ...prev,
//       certifications: prev.certifications.filter(cert => cert.id !== certificationId)
//     }));
//   };

//   const addHospitalAffiliation = () => {
//     if (newHospitalAffiliation.hospitalName && newHospitalAffiliation.position && newHospitalAffiliation.startDate) {
//       setFormData(prev => ({
//         ...prev,
//         hospitalAffiliations: [...prev.hospitalAffiliations, { ...newHospitalAffiliation, id: Date.now() }]
//       }));
//       setNewHospitalAffiliation({
//         hospitalName: '',
//         position: '',
//         startDate: '',
//         endDate: '',
//         isCurrent: false
//       });
//     }
//   };

//   const removeHospitalAffiliation = (affiliationId) => {
//     setFormData(prev => ({
//       ...prev,
//       hospitalAffiliations: prev.hospitalAffiliations.filter(affiliation => affiliation.id !== affiliationId)
//     }));
//   };

// const handleSave = async () => {

  

//     try {
//       setIsLoading(true);
      
//       // Validate form data before sending
//       const validationErrors = validateFormData(formData);
//       if (validationErrors.length > 0) {
//         toast({
//           title: "Validation Error",
//           description: `Please fix the following errors:\n${validationErrors.join('\n')}`,
//           variant: "destructive",
//         });
//         setIsLoading(false);
//         return;
//       }

//       const cleanCertifications = formData.certifications.map(({ id, ...rest }) => rest);
//       const cleanAffiliations = formData.hospitalAffiliations.map(({ id, ...rest }) => rest);

//       // Prepare data for API call
//       const profileData = {
//           ...formData,
//           certifications: cleanCertifications,
//           hospitalAffiliations: cleanAffiliations,
//           experience: Number(formData.experience),
//           graduationYear: Number(formData.graduationYear),
//           consultationFee: Number(formData.consultationFee),
//           consultationDuration: Number(formData.consultationDuration),
//           updatedAt: new Date().toISOString()
// };

//       const token = localStorage.getItem('authToken');
//       const apiUrl = doctorProfile 
//         ? `${baseUrl}/api/doctor/profile/${doctorProfile._id}`
//         : `${baseUrl}/api/doctor/profile`;

//       // Make API call to save profile data
//       const response = await fetch(apiUrl, {
//         method: doctorProfile ? 'PUT' : 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify(profileData)
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const savedData = await response.json();
      
//       // Update local state with saved data
//       setFormData(savedData);
//       setIsEditing(false);
//       setIsLoading(false);
      
//       // Show success message
//       toast({
//         title: "Success",
//         description: "Profile updated successfully!",
//         variant: "default",
//       });
      
//       // Refresh the page to get updated data
//       // fetchDoctorData()
//       window.location.reload();

      
//     } catch (error) {
//       console.error('Error saving profile:', error);
//       setIsLoading(false);
      
//       // Show user-friendly error message
//       let errorMessage = 'Failed to save profile. Please try again.';
      
//       if (error.name === 'NetworkError' || !navigator.onLine) {
//         errorMessage = 'Network error. Please check your connection and try again.';
//       } else if (error.message.includes('401')) {
//         errorMessage = 'Your session has expired. Please log in again.';
//       } else if (error.message.includes('422')) {
//         errorMessage = 'Invalid data. Please check your inputs and try again.';
//       }
      
//       toast({
//         title: "Error",
//         description: errorMessage,
//         variant: "destructive",
//       });
//     }
//   };

// // Helper function for form validation
// const validateFormData = (data) => {
//     const errors = [];
    
//     if (!data.fullName || data.fullName.trim().length < 2) {
//       errors.push('Full name must be at least 2 characters long');
//     }
    
//     if (!data.phoneNumber || !/^\+?[\d\s\-\(\)]{10,}$/.test(data.phoneNumber)) {
//       errors.push('Please enter a valid phone number');
//     }
    
//     if (!data.specialty) {
//       errors.push('Please select a specialty');
//     }
    
//     if (!data.licenseNumber) {
//       errors.push('License number is required');
//     }
    
//     if (!data.experience || data.experience < 0) {
//   errors.push('Please enter valid years of experience');
// } else if (data.graduationYear) {
//   const yearsSinceGraduation = new Date().getFullYear() - data.graduationYear;
//   if (data.experience > yearsSinceGraduation) {
//     errors.push(`Experience cannot exceed ${yearsSinceGraduation} years since graduation`);
//   }
// }
    
//     if (!data.medicalDegree) {
//       errors.push('Please select a medical degree');
//     }
    
//     if (!data.medicalSchool) {
//       errors.push('Medical school is required');
//     }
    
//     if (!data.graduationYear || data.graduationYear < 1950 || data.graduationYear > new Date().getFullYear()) {
//       errors.push('Please enter a valid graduation year');
//     }
    
//     if (!data.address.street || !data.address.city || !data.address.state || !data.address.zipCode) {
//       errors.push('Complete address is required');
//     }
    
//     return errors;
//   };

//   const specialtys = [
//     'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
//       'General Medicine', 'Gynecology', 'Neurology', 'Oncology',
//       'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
//       'Surgery', 'Urology', 'Ophthalmology', 'ENT', 'Anesthesia',
//       'Emergency Medicine', 'Family Medicine', 'Internal Medicine',
//       'Pathology', 'Pulmonology', 'Rheumatology', 'Nephrology',
//       'Hematology', 'Infectious Disease', 'Allergy & Immunology',
//       'Physical Medicine', 'Plastic Surgery', 'Preventive Medicine'
//   ];

//   const medicalDegrees = ['MBBS', 'MD', 'DO', 'BAMS', 'BHMS', 'BDS', 'MDS', 'Other'];

//   const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
// const currentYear = new Date().getFullYear();

//   const isExperienceInvalid = (
//     doctorProfile?.experience &&
//     doctorProfile?.graduationYear &&
//     doctorProfile.experience > (currentYear - doctorProfile.graduationYear)
//   );

//   if (!isEditing && doctorProfile) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
//           <Button 
//             onClick={() => setIsEditing(true)}
//             className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
//           >
//             <Edit className="h-4 w-4 mr-2" />
//             Edit Profile
//           </Button>
//         </div>

//         {/* Display Current Profile */}
//         <div className="grid lg:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Personal Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
//                   {doctorProfile.profilePhoto ? (
//                     <img src={doctorProfile.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
//                   ) : (
//                     <User className="h-8 w-8 text-blue-600" />
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold">{doctorProfile.fullName}</h3>
//                   <p className="text-gray-600">{user?.email}</p>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Phone</Label>
//                   <p className="text-gray-800">{doctorProfile.phoneNumber}</p>
//                 </div>
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Experience</Label>
//                   <p className="text-gray-800">{doctorProfile.experience} years</p>
//                 </div>
//               </div>
//               {doctorProfile.bio && (
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Bio</Label>
//                   <p className="text-gray-800">{doctorProfile.bio}</p>
//                 </div>
//               )}
//               {doctorProfile.languages && doctorProfile.languages.length > 0 && (
//                 <div>
//                   <Label className="text-sm font-medium text-gray-600">Languages</Label>
//                   <div className="flex flex-wrap gap-2 mt-1">
//                     {doctorProfile.languages.map((lang, index) => (
//                       <Badge key={index} variant="secondary">{lang}</Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <GraduationCap className="h-5 w-5" />
//                 Professional Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">

//         <div>
//           <Label className="text-sm font-medium text-gray-600">Specialty</Label>
//           <p className="text-gray-800">
//             {doctorProfile?.specialty || <span className="text-red-500 italic">Missing</span>}
//           </p>
//         </div>

//         <div>
//           <Label className="text-sm font-medium text-gray-600">License Number</Label>
//           <p className="text-gray-800">
//             {doctorProfile?.licenseNumber || <span className="text-red-500 italic">Missing</span>}
//           </p>
//         </div>

//         <div>
//           <Label className="text-sm font-medium text-gray-600">Medical Degree</Label>
//           <p className="text-gray-800">
//             {doctorProfile?.medicalDegree || <span className="text-red-500 italic">Missing</span>}
//           </p>
//         </div>

//         <div>
//           <Label className="text-sm font-medium text-gray-600">Graduation Year</Label>
//           <p className="text-gray-800">
//             {doctorProfile?.graduationYear || <span className="text-red-500 italic">Missing</span>}
//           </p>
//         </div>

//       </div>

//       <div>
//         <Label className="text-sm font-medium text-gray-600">Medical School</Label>
//         <p className="text-gray-800">
//           {doctorProfile?.medicalSchool || <span className="text-red-500 italic">Missing</span>}
//         </p>
//       </div>

//       <div>
//         <Label className="text-sm font-medium text-gray-600">Years of Experience</Label>
//         <p className={`text-gray-800 ${isExperienceInvalid ? 'text-red-600 font-semibold' : ''}`}>
//           {doctorProfile?.experience !== undefined
//             ? `${doctorProfile.experience} year${doctorProfile.experience === 1 ? '' : 's'}`
//             : <span className="text-red-500 italic">Missing</span>}
//         </p>
//         {isExperienceInvalid && (
//           <p className="text-sm text-red-500">
//             ⚠ Experience exceeds time since graduation ({currentYear - doctorProfile.graduationYear} years)
//           </p>
//         )}
//       </div>
//     </CardContent>
//           </Card>
//         </div>

//         {doctorProfile.address && (
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 Address Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-800">
//                 {doctorProfile.address.street}, {doctorProfile.address.city}, {doctorProfile.address.state} {doctorProfile.address.zipCode}, {doctorProfile.address.country}
//               </p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">
//           {doctorProfile ? 'Edit Profile' : 'Complete Your Profile'}
//         </h1>
//         <div className="flex gap-2">
//           <Button 
//             variant="outline" 
//             onClick={() => setIsEditing(false)}
//           >
//             Cancel
//           </Button>
//  <Button 
//     onClick={handleSave}
//     disabled={isLoading}
//     className="bg-gradient-to-r from-green-500 to-green-600 text-white"
//   >
//     {isLoading ? (
//       <>
//         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//         Saving...
//       </>
//     ) : (
//       <>
//         <Save className="h-4 w-4 mr-2" />
//         Save Profile
//       </>
//     )}
//   </Button>
//         </div>
//       </div>

//       {/* Personal Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <User className="h-5 w-5" />
//             Personal Information
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="fullName">Full Name *</Label>
//               <Input
//                 id="fullName"
//                 value={formData.fullName}
//                 onChange={(e) => handleInputChange('fullName', e.target.value)}
//                 placeholder="Enter your full name"
//               />
//             </div>
//             <div>
//               <Label htmlFor="phoneNumber">Phone Number *</Label>
//               <Input
//                 id="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
//                 placeholder="Enter your phone number"
//               />
//             </div>
//           </div>
          
//           <div>
//             <Label htmlFor="bio">Bio</Label>
//             <Textarea
//               id="bio"
//               value={formData.bio}
//               onChange={(e) => handleInputChange('bio', e.target.value)}
//               placeholder="Tell us about yourself..."
//               rows={3}
//             />
//           </div>

//           <div>
//             <Label>Languages</Label>
//             <div className="flex gap-2 mb-2">
//               <Input
//                 value={newLanguage}
//                 onChange={(e) => setNewLanguage(e.target.value)}
//                 placeholder="Add a language"
//                 onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
//               />
//               <Button type="button" onClick={addLanguage} size="sm">
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {formData.languages.map((lang, index) => (
//                 <Badge key={index} variant="secondary" className="flex items-center gap-1">
//                   {lang}
//                   <button onClick={() => removeLanguage(lang)} className="ml-1">
//                     <X className="h-3 w-3" />
//                   </button>
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Professional Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <GraduationCap className="h-5 w-5" />
//             Professional Information
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="specialty">specialty *</Label>
//               <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select specialty" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {specialtys.map((spec) => (
//                     <SelectItem key={spec} value={spec}>{spec}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="licenseNumber">License Number *</Label>
//               <Input
//                 id="licenseNumber"
//                 value={formData.licenseNumber}
//                 onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
//                 placeholder="Enter your license number"
//               />
//             </div>
//             <div>
//               <Label htmlFor="experience">Years of Experience *</Label>
//               <Input
//                 id="experience"
//                 type="number"
//                 value={formData.experience}
//                 onChange={(e) => handleInputChange('experience', e.target.value)}
//                 placeholder="Enter years of experience"
//                 min="0"
//                 max="60"
//               />
//             </div>
//             <div>
//               <Label htmlFor="medicalDegree">Medical Degree *</Label>
//               <Select value={formData.medicalDegree} onValueChange={(value) => handleInputChange('medicalDegree', value)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select medical degree" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {medicalDegrees.map((degree) => (
//                     <SelectItem key={degree} value={degree}>{degree}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="medicalSchool">Medical School *</Label>
//               <Input
//                 id="medicalSchool"
//                 value={formData.medicalSchool}
//                 onChange={(e) => handleInputChange('medicalSchool', e.target.value)}
//                 placeholder="Enter your medical school"
//               />
//             </div>
//             <div>
//               <Label htmlFor="graduationYear">Graduation Year *</Label>
//               <Input
//                 id="graduationYear"
//                 type="number"
//                 value={formData.graduationYear}
//                 onChange={(e) => handleInputChange('graduationYear', e.target.value)}
//                 placeholder="Enter graduation year"
//                 min="1950"
//                 max={new Date().getFullYear()}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Address Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="h-5 w-5" />
//             Address Information
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <Label htmlFor="street">Street Address *</Label>
//             <Input
//               id="street"
//               value={formData.address.street}
//               onChange={(e) => handleAddressChange('street', e.target.value)}
//               placeholder="Enter street address"
//             />
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div>
//               <Label htmlFor="city">City *</Label>
//               <Input
//                 id="city"
//                 value={formData.address.city}
//                 onChange={(e) => handleAddressChange('city', e.target.value)}
//                 placeholder="Enter city"
//               />
//             </div>
//             <div>
//               <Label htmlFor="state">State *</Label>
//               <Input
//                 id="state"
//                 value={formData.address.state}
//                 onChange={(e) => handleAddressChange('state', e.target.value)}
//                 placeholder="Enter state"
//               />
//             </div>
//             <div>
//               <Label htmlFor="zipCode">ZIP Code *</Label>
//               <Input
//                 id="zipCode"
//                 value={formData.address.zipCode}
//                 onChange={(e) => handleAddressChange('zipCode', e.target.value)}
//                 placeholder="Enter ZIP code"
//               />
//             </div>
//             <div>
//               <Label htmlFor="country">Country *</Label>
//               <Input
//                 id="country"
//                 value={formData.address.country}
//                 onChange={(e) => handleAddressChange('country', e.target.value)}
//                 placeholder="Enter country"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Certifications */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Award className="h-5 w-5" />
//             Certifications
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
//             <Input
//               placeholder="Certification name"
//               value={newCertification.name}
//               onChange={(e) => setNewCertification(prev => ({...prev, name: e.target.value}))}
//             />
//             <Input
//               placeholder="Issuing organization"
//               value={newCertification.issuingOrganization}
//               onChange={(e) => setNewCertification(prev => ({...prev, issuingOrganization: e.target.value}))}
//             />
//             <Input
//               type="date"
//               placeholder="Issue date"
//               value={newCertification.issueDate}
//               onChange={(e) => setNewCertification(prev => ({...prev, issueDate: e.target.value}))}
//             />
//             <div className="flex gap-2">
//               <Input
//                 type="date"
//                 placeholder="Expiry date (optional)"
//                 value={newCertification.expiryDate}
//                 onChange={(e) => setNewCertification(prev => ({...prev, expiryDate: e.target.value}))}
//               />
//               <Button type="button" onClick={addCertification} size="sm">
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             {formData.certifications.map((cert, index) => (
//               <div key={cert.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="font-medium">{cert.name}</p>
//                   <p className="text-sm text-gray-600">{cert.issuingOrganization} • {cert.issueDate}</p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => removeCertification(cert.id || index)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Hospital Affiliations */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Building className="h-5 w-5" />
//             Hospital Affiliations
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <Input
//               placeholder="Hospital name"
//               value={newHospitalAffiliation.hospitalName}
//               onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, hospitalName: e.target.value}))}
//             />
//             <Input
//               placeholder="Position"
//               value={newHospitalAffiliation.position}
//               onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, position: e.target.value}))}
//             />
//             <Input
//               type="date"
//               placeholder="Start date"
//               value={newHospitalAffiliation.startDate}
//               onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, startDate: e.target.value}))}
//             />
//             <Input
//               type="date"
//               placeholder="End date (optional)"
//               value={newHospitalAffiliation.endDate}
//               onChange={(e) => setNewHospitalAffiliation(prev => ({...prev, endDate: e.target.value}))}
//               disabled={newHospitalAffiliation.isCurrent}
//             />
//             <div className="flex items-center gap-2">
//               <Checkbox
//                 checked={newHospitalAffiliation.isCurrent}
//                 onCheckedChange={(checked) => setNewHospitalAffiliation(prev => ({...prev, isCurrent: checked}))}
//               />
//               <Label className="text-sm">Current</Label>
//               <Button type="button" onClick={addHospitalAffiliation} size="sm">
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
          
//           <div className="space-y-2">
//             {formData.hospitalAffiliations.map((affiliation, index) => (
//               <div key={affiliation.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="font-medium">{affiliation.hospitalName}</p>
//                   <p className="text-sm text-gray-600">
//                     {affiliation.position} • {affiliation.startDate} - {affiliation.isCurrent ? 'Present' : affiliation.endDate}
//                   </p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => removeHospitalAffiliation(affiliation.id || index)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Consultation Settings */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <DollarSign className="h-5 w-5" />
//             Consultation Settings
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
//               <Input
//                 id="consultationFee"
//                 type="number"
//                 value={formData.consultationFee}
//                 onChange={(e) => handleInputChange('consultationFee', e.target.value)}
//                 placeholder="Enter consultation fee"
//                 min="0"
//               />
//             </div>
//             <div>
//               <Label htmlFor="consultationDuration">Consultation Duration (minutes)</Label>
//               <Input
//                 id="consultationDuration"
//                 type="number"
//                 value={formData.consultationDuration}
//                 onChange={(e) => handleInputChange('consultationDuration', e.target.value)}
//                 placeholder="Enter duration"
//                 min="15"
//                 max="120"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Availability Schedule */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Clock className="h-5 w-5" />
//             Availability Schedule
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {daysOfWeek.map((day) => (
//             <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
//               <div className="w-24">
//                 <Checkbox
//                   checked={formData.availabilitySchedule[day].isAvailable}
//                   onCheckedChange={(checked) => handleAvailabilityChange(day, 'isAvailable', checked)}
//                 />
//                 <Label className="ml-2 capitalize">{day}</Label>
//               </div>
//               {formData.availabilitySchedule[day].isAvailable && (
//                 <div className="flex gap-2">
//                   <Input
//                     type="time"
//                     value={formData.availabilitySchedule[day].startTime}
//                     onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
//                     className="w-32"
//                   />
//                   <span className="self-center">to</span>
//                   <Input
//                     type="time" 
//                     value={formData.availabilitySchedule[day].endTime}
//                     onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
//                     className="w-32"
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default DoctorDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, Users, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import ConsultationsView from '@/components/doctordashboard/ConsultationsView';
import PatientsView from '@/components/doctordashboard/PatientsView';
import MessagesView from '@/components/doctordashboard/MessagesView';
import ReportsView from '@/components/doctordashboard/ReportsView';
import DoctorProfileView from '@/components/doctordashboard/DoctorProfileView';
import DoctorOverview from '@/components/doctordashboard/DoctorOverview';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

const DoctorDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (!storedUser || !token) {
      navigate('/auth');
      return;
    }
    
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    setUser(userData);
    fetchDoctorData(userData.id, token);
  }, [navigate]);

  const fetchDoctorData = async (userId: string, token: string) => {
    try {
      const profileResponse = await fetch(`${baseUrl}/api/doctor/profile/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setDoctorProfile(profileData);

        const patientsResponse = await fetch(`${baseUrl}/api/doctor/patients/${profileData._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          setPatients(patientsData.patients || []);
        }
      } else {
        console.log('Doctor profile not found, needs to be created');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'consultations', label: 'Consultations', icon: Users },
    { id: 'messages', label: 'Messages', icon: Users },
    { id: 'reports', label: 'Reports', icon: Users },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return <PatientsView patients={patients} />;
      case 'consultations':
        return <ConsultationsView doctorProfile={doctorProfile} />;
      case 'messages':
        return <MessagesView />;
      case 'reports':
        return <ReportsView doctorId={doctorProfile._id} />;
      case 'profile':
        return <DoctorProfileView doctorProfile={doctorProfile} user={user} />;
      default:
        return <DoctorOverview patients={patients} doctorProfile={doctorProfile} loading={loading} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Doctor Portal
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-blue-100 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="p-6 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Doctor Portal
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Dr. {doctorProfile?.fullName || user?.email || 'Loading...'}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
