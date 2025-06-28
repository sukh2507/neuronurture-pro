// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Users, UserCheck, UserX, Shield, BarChart3, Settings, LogOut, Menu, X, Trash2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from '@/hooks/use-toast';

// const AdminDashboard = () => {
//   const [user, setUser] = useState<any>(null);
//   const [stats, setStats] = useState<any>({});
//   const [users, setUsers] = useState<any[]>([]);
//   const [doctors, setDoctors] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     const token = localStorage.getItem('authToken');
    
//     if (!storedUser || !token) {
//       navigate('/auth');
//       return;
//     }
    
//     const userData = JSON.parse(storedUser);
//     if (userData.role !== 'admin') {
//       navigate('/dashboard');
//       return;
//     }
    
//     setUser(userData);
//     fetchAdminData(token);
//   }, [navigate]);

//   const fetchAdminData = async (token: string) => {
//     try {
//       // Fetch admin stats
//       const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (statsResponse.ok) {
//         const statsData = await statsResponse.json();
//         setStats(statsData);
//       }

//       // Fetch all users
//       const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       if (usersResponse.ok) {
//         const usersData = await usersResponse.json();
//         setUsers(usersData.users);
//         setDoctors(usersData.doctors);
//       }
//     } catch (error) {
//       console.error('Error fetching admin data:', error);
//       toast({
//         title: "Error",
//         description: "Failed to load admin data",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('user');
//     navigate('/');
//   };

//   const handleDeleteUser = async (userId: string) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`${baseUrl}/api/admin/user/${userId}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         setUsers(users.filter(u => u._id !== userId));
//         toast({
//           title: "Success",
//           description: "User deleted successfully",
//         });
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       toast({
//         title: "Error",
//         description: "Failed to delete user",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleVerifyDoctor = async (doctorId: string) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`${baseUrl}/api/admin/doctor/verify/${doctorId}`, {
//         method: 'PUT',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       if (response.ok) {
//         fetchAdminData(token);
//         toast({
//           title: "Success",
//           description: "Doctor verified successfully",
//         });
//       }
//     } catch (error) {
//       console.error('Error verifying doctor:', error);
//       toast({
//         title: "Error",
//         description: "Failed to verify doctor",
//         variant: "destructive",
//       });
//     }
//   };

//   const menuItems = [
//     { id: 'overview', label: 'Overview', icon: BarChart3 },
//     { id: 'users', label: 'Users', icon: Users },
//     { id: 'doctors', label: 'Doctors', icon: UserCheck },
//     { id: 'settings', label: 'Settings', icon: Settings },
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'users':
//         return <UsersManagement users={users} onDeleteUser={handleDeleteUser} />;
//       case 'doctors':
//         return <DoctorsManagement doctors={doctors} onVerifyDoctor={handleVerifyDoctor} />;
//       case 'settings':
//         return <AdminSettings />;
//       default:
//         return <AdminOverview stats={stats} />;
//     }
//   };

//   if (!user) {
//     return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
//       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
//     </div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white shadow-sm border-b border-purple-100 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full">
//               <Shield className="h-6 w-6 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//               Admin Portal
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
//           fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-purple-100 z-50 transform transition-transform duration-300 ease-in-out
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:translate-x-0
//         `}>
//           <div className="p-6 border-b border-purple-100">
//             <div className="flex items-center gap-2">
//               <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full">
//                 <Shield className="h-6 w-6 text-white" />
//               </div>
//               <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 Admin Portal
//               </span>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">System Administrator</p>
//           </div>

//           <nav className="p-4 space-y-2">
//             {menuItems.map((item) => (
//               <Button
//                 key={item.id}
//                 variant={activeTab === item.id ? "default" : "ghost"}
//                 className={`w-full justify-start ${
//                   activeTab === item.id 
//                     ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
//                     : 'text-gray-700 hover:bg-purple-50'
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
//               className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
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

// const AdminOverview = ({ stats }: any) => {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
//           <p className="text-gray-600">System overview and management</p>
//         </div>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100">Total Users</p>
//                 <p className="text-3xl font-bold">{stats.overview?.totalUsers || 0}</p>
//               </div>
//               <Users className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-pink-100">Mothers</p>
//                 <p className="text-3xl font-bold">{stats.overview?.totalMothers || 0}</p>
//               </div>
//               <UserCheck className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-red-100">Doctors</p>
//                 <p className="text-3xl font-bold">{stats.overview?.totalDoctors || 0}</p>
//               </div>
//               <UserCheck className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-orange-100">Children</p>
//                 <p className="text-3xl font-bold">{stats.overview?.totalChildren || 0}</p>
//               </div>
//               <Users className="h-8 w-8" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Registrations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {stats.recentRegistrations?.slice(0, 5).map((user: any, index: number) => (
//                 <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
//                   <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
//                     <Users className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium">{user.email}</p>
//                     <p className="text-sm text-gray-600 capitalize">{user.role}</p>
//                   </div>
//                 </div>
//               )) || (
//                 <p className="text-gray-500 text-center">No recent registrations</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>System Statistics</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Total Posts</span>
//                 <span className="font-semibold">{stats.overview?.totalPosts || 0}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Total Messages</span>
//                 <span className="font-semibold">{stats.overview?.totalChats || 0}</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">Pending Approvals</span>
//                 <span className="font-semibold text-orange-600">3</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-gray-600">System Status</span>
//                 <span className="font-semibold text-green-600">Online</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// const UsersManagement = ({ users, onDeleteUser }: any) => {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
      
//       <div className="grid gap-4">
//         {users?.map((user: any) => (
//           <Card key={user._id}>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
//                     <Users className="h-6 w-6 text-purple-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">{user.email}</h3>
//                     <p className="text-gray-600 capitalize">Role: {user.role}</p>
//                     <p className="text-sm text-gray-500">
//                       Joined: {new Date(user.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {user.isApproved ? 'Approved' : 'Pending'}
//                   </span>
//                   <Button 
//                     variant="outline" 
//                     size="sm"
//                     onClick={() => onDeleteUser(user._id)}
//                     className="text-red-600 border-red-200 hover:bg-red-50"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )) || (
//           <Card>
//             <CardContent className="p-12 text-center">
//               <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-600 mb-2">No users found</h3>
//               <p className="text-gray-500">Users will appear here once registered</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// const DoctorsManagement = ({ doctors, onVerifyDoctor }: any) => {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Doctors Management</h1>
      
//       <div className="grid gap-4">
//         {doctors?.map((doctor: any) => (
//           <Card key={doctor._id}>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
//                     <UserCheck className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold">{doctor.fullName}</h3>
//                     <p className="text-gray-600">{doctor.specialization}</p>
//                     <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
//                     <p className="text-sm text-gray-500">Experience: {doctor.yearsOfExperience} years</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded-full text-xs ${
//                     doctor.userId?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                   }`}>
//                     {doctor.userId?.isApproved ? 'Verified' : 'Pending'}
//                   </span>
//                   {!doctor.userId?.isApproved && (
//                     <Button 
//                       size="sm"
//                       onClick={() => onVerifyDoctor(doctor._id)}
//                       className="bg-green-600 text-white hover:bg-green-700"
//                     >
//                       <UserCheck className="h-4 w-4 mr-2" />
//                       Verify
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )) || (
//           <Card>
//             <CardContent className="p-12 text-center">
//               <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-600 mb-2">No doctors found</h3>
//               <p className="text-gray-500">Doctor registrations will appear here</p>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// const AdminSettings = () => {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
//       <Card>
//         <CardHeader>
//           <CardTitle>Application Configuration</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <h4 className="font-medium text-gray-800">User Registration</h4>
//               <p className="text-sm text-gray-600">Allow new user registration</p>
//             </div>
//             <input type="checkbox" defaultChecked className="rounded" />
//           </div>
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <h4 className="font-medium text-gray-800">Doctor Auto-Approval</h4>
//               <p className="text-sm text-gray-600">Automatically approve doctor registrations</p>
//             </div>
//             <input type="checkbox" className="rounded" />
//           </div>
//           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//             <div>
//               <h4 className="font-medium text-gray-800">Email Notifications</h4>
//               <p className="text-sm text-gray-600">Send system email notifications</p>
//             </div>
//             <input type="checkbox" defaultChecked className="rounded" />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

const AdminDashboard = () => {
  const [user, setUser] = useState({ role: 'admin', email: 'admin@example.com' });
    const navigate = useNavigate();

  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalMothers: 0,
      totalDoctors: 0,
      totalChildren: 0,
      totalPosts: 0,
      totalChats: 0,
      pendingApprovals: 0
    },
    recentRegistrations: []
  });
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  
  // API call function
  const fetchUsers = async () => {
    
    try {
      const token = localStorage.getItem('authToken'); // Assuming you store JWT token in localStorage
      const response = await fetch(`${baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  // Process user data and calculate statistics
  const processUserData = (userData) => {
    // Filter out admin users for total count
    const nonAdminUsers = userData.filter(user => user.role !== 'admin');
    
    // Count users by role
    const mothers = userData.filter(user => user.role === 'mother');
    const doctors = userData.filter(user => user.role === 'doctor');
    
    // Sort users by creation date (most recent first) for recent registrations
    const sortedUsers = [...userData]
      .filter(user => user.role !== 'admin') // Exclude admin from recent registrations
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate statistics
    const processedStats = {
      overview: {
        totalUsers: nonAdminUsers.length,
        totalMothers: mothers.length,
        totalDoctors: doctors.length,
        totalChildren: 0, // You'll need to implement this based on your children data structure
        totalPosts: 0, // You'll need to fetch this from posts API
        totalChats: 0, // You'll need to fetch this from chats API
        pendingApprovals: userData.filter(user => user.needsChoice === true).length
      },
      recentRegistrations: sortedUsers.slice(0, 10) // Get last 10 registrations
    };

    return processedStats;
  };

  // Load data on component mount
  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      // Fetch all users
      const userResponse = await fetch(`${baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch users');
      const userData = await userResponse.json();

      // Fetch total children count using new optimized route
      const childrenCountResponse = await fetch(`${baseUrl}/api/mother/children-count`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!childrenCountResponse.ok) throw new Error('Failed to fetch total children');
      const { totalChildren } = await childrenCountResponse.json();

      // Process and set stats
      const processedStats = processUserData(userData);
      processedStats.overview.totalChildren = totalChildren;

      setStats(processedStats);
      setUsers(userData.filter(user => user.role !== 'admin'));
      setDoctors(userData.filter(user => user.role === 'doctor'));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);



  const handleLogout = () => {
  localStorage.removeItem('authToken'); // or 'token' if that's used
  navigate('/auth'); // Redirect to auth page
};


const handleDeleteUser = async (userId) => {
  const token = localStorage.getItem('authToken');

  if (!window.confirm('Are you sure you want to delete this user and their profile?')) return;

  try {
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }

    // Remove the user from frontend state
    setUsers((prev) => prev.filter((user) => user._id !== userId));
    setDoctors((prev) => prev.filter((doc) => doc._id !== userId));

    setStats((prevStats) => ({
      ...prevStats,
      overview: {
        ...prevStats.overview,
        totalUsers: prevStats.overview.totalUsers - 1,
        totalMothers: prevStats.overview.totalMothers - 1,
        totalDoctors: prevStats.overview.totalDoctors - 1,
        pendingApprovals: prevStats.overview.pendingApprovals - 1,
      },
    }));

    alert('User deleted successfully.');
  } catch (err) {
    console.error('Error deleting user:', err);
    alert(`Error: ${err.message}`);
  }
};


    const handleDeleteDoctor = (doctorId) => {
    setDoctors(doctors.filter(doc => doc._id !== doctorId));
    // Also remove from users list since doctors are also users
    setUsers(users.filter(u => u._id !== doctorId));
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      overview: {
        ...prevStats.overview,
        totalDoctors: prevStats.overview.totalDoctors - 1,
        totalUsers: prevStats.overview.totalUsers - 1
      }
    }));
  };



    const handleVerifyDoctor = (doctorId) => {
    setDoctors(doctors.map(doc => 
      doc._id === doctorId 
        ? { ...doc, needsChoice: false }
        : doc
    ));
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      overview: {
        ...prevStats.overview,
        pendingApprovals: prevStats.overview.pendingApprovals - 1
      }
    }));
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return <UsersManagement users={users} onDeleteUser={handleDeleteUser} />;
      case 'doctors':
        return (
          <DoctorsManagement 
            doctors={doctors} 
            onVerifyDoctor={handleVerifyDoctor}
            onDeleteDoctor={handleDeleteDoctor} // Pass the function
          />
        );
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-purple-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-purple-100 z-50 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="p-6 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">System Administrator</p>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center justify-start px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' 
                    : 'text-gray-700 hover:bg-purple-50'
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              className="w-full flex items-center justify-center px-4 py-2 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
        
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AdminOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">System overview and management</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Users</p>
              <p className="text-3xl font-bold">{stats.overview?.totalUsers || 0}</p>
            </div>
            <Users className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Mothers</p>
              <p className="text-3xl font-bold">{stats.overview?.totalMothers || 0}</p>
            </div>
            <UserCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Doctors</p>
              <p className="text-3xl font-bold">{stats.overview?.totalDoctors || 0}</p>
            </div>
            <UserCheck className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Children</p>
              <p className="text-3xl font-bold">{stats.overview?.totalChildren || 0}</p>
            </div>
            <Users className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Registrations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentRegistrations?.length > 0 ? (
                stats.recentRegistrations.slice(0, 5).map((user, index) => (
                  <div key={user._id || index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No recent registrations</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">System Statistics</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">{stats.overview?.totalPosts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Messages</span>
                <span className="font-semibold">{stats.overview?.totalChats || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Approvals</span>
                <span className="font-semibold text-orange-600">{stats.overview?.pendingApprovals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">System Status</span>
                <span className="font-semibold text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Users, Trash2 } from 'lucide-react';

const UsersManagement = ({ users, onDeleteUser }) => {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600">Manage and monitor platform users</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Users: {users?.length || 0}
        </div>
      </div>

      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{user.email}</h3>
                    <p className="text-gray-600 capitalize">Role: {user.role}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">User ID: {user._id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <button 
                    className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-1 text-sm transition-colors"
                    onClick={() => onDeleteUser(user._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">User registrations will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
};



interface DoctorsManagementProps {
  doctors: any[];
  onVerifyDoctor: (doctorId: string) => void;
  onDeleteDoctor: (doctorId: string) => void; // Add this prop
}

const DoctorsManagement = ({ doctors, onVerifyDoctor, onDeleteDoctor }: DoctorsManagementProps) => {
  const handleRemoveDoctor = async (doctorId: string, doctorEmail: string) => {
    try {
      // Show confirmation dialog
      const isConfirmed = window.confirm(
        `Are you sure you want to remove doctor ${doctorEmail}? This action cannot be undone.`
      );
      
      if (!isConfirmed) {
        return;
      }

      // Get auth token
      const token = localStorage.getItem('authToken')

      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      console.log('Attempting to delete doctor:', doctorId);

      // Use the correct endpoint that matches your backend
      const response = await fetch(`${baseUrl}/api/doctor/${doctorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          alert('Unauthorized. Please login again.');
          return;
        } else if (response.status === 404) {
          alert('Doctor not found.');
          return;
        } else if (response.status === 403) {
          alert('You do not have permission to delete doctors.');
          return;
        }
        
        // Try to get error message from response
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        alert(`Failed to remove doctor: ${errorMessage}`);
        return;
      }

      // Parse successful response
      let data;
      try {
        data = await response.json();
        console.log('Success response:', data);
      } catch (parseError) {
        console.log('Could not parse response as JSON, but status was ok');
        // If we can't parse but status is ok, assume success
        data = { success: true, message: 'Doctor removed successfully' };
      }

      // Handle success
      if (data.success !== false) {
        alert(data.message || `Doctor ${doctorEmail} has been successfully removed`);
        onDeleteDoctor(doctorId);
      } else {
        alert(`Failed to remove doctor: ${data.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Error removing doctor:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network error: Unable to connect to server. Please check if the server is running.');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Doctors Management</h1>
          <p className="text-gray-600">Manage and verify doctor accounts</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Doctors: {doctors?.length || 0}
        </div>
      </div>
      
      <div className="grid gap-4">
        {doctors?.length > 0 ? (
          doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{doctor.email}</h3>
                    <p className="text-gray-600 capitalize">Role: {doctor.role}</p>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(doctor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      User ID: {doctor._id}
                    </p>
                    {doctor.lastChoiceAt && (
                      <p className="text-sm text-gray-500">
                        Last Active: {new Date(doctor.lastChoiceAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      !doctor.needsChoice 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {!doctor.needsChoice ? 'Active' : 'Needs Setup'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {doctor.needsChoice && (
                      <button 
                        className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center gap-1 text-sm transition-colors"
                        onClick={() => onVerifyDoctor(doctor._id)}
                      >
                        <UserCheck className="h-4 w-4" />
                        Mark as Setup
                      </button>
                    )}
                    
                    <button 
                      className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center gap-1 text-sm transition-colors"
                      onClick={() => handleRemoveDoctor(doctor._id, doctor.email)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
            <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500">Doctor registrations will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
};
const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Application Configuration</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">User Registration</h4>
              <p className="text-sm text-gray-600">Allow new user registration</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Doctor Auto-Approval</h4>
              <p className="text-sm text-gray-600">Automatically approve doctor registrations</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send system email notifications</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;