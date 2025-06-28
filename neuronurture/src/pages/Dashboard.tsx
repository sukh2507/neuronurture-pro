import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Brain, Calendar, MessageSquare, User, Bell, Menu, X ,Users} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import MoodTracker from '@/components/MoodTracker';
import ChildScreening from '@/components/ChildScreening';
import Timeline from '@/components/Timeline';
import Forum from '@/components/Forum';
import Profile from '@/components/Profile';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DoctorConsultation from '@/components/DoctorConsultation';
import NeuroAIChat from '@/components/NeuroAIChat';
import ReportsView from '@/components/doctordashboard/ReportsView';
import MaternalSelfReports from '@/components/MaternalSelfReports';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;


interface MoodLog {
  date: string;
  mood: number;
  notes: string;
}

interface MoodTrackingData {
  moodData: number[];
  moodNotes: string[];
  moodLogs: MoodLog[];
  averageMood: number;
  numberOfMoodTracking: number;
  happyDays: number;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [motherProfile, setMotherProfile] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { section } = useParams();
  const [averageMood, setAverageMood] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodStats, setMoodStats] = useState<MoodTrackingData>();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchDashboardData();
      fetchMoodStats();
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    if (section) {
      setActiveTab(section);
    }
  }, [section]);

  useEffect(() => {
    if (motherProfile?.moodTracking?.moodLogs && moodHistory.length === 0 && !fetchingData) {
      const formattedHistory = motherProfile.moodTracking.moodLogs.map((log: any) => ({
        date: new Date(log.date).toISOString().split('T')[0],
        mood: log.mood,
        notes: log.notes
      }));
      setMoodHistory(formattedHistory);
      setMoodStats(motherProfile.moodTracking);
    }
  }, [motherProfile, moodHistory.length, fetchingData]);

  const fetchMoodStats = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${baseUrl}/api/mood/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAverageMood(data.averageMood);
        setTotalCheckIns(data.numberOfMoodTracking);
        console.log(`actual :${data.averageMood} set as:${averageMood}`)
        console.log(`actual :${data.numberOfMoodTracking} set as:${totalCheckIns}`)
      }
    } catch (error) {
      console.error('Failed to fetch mood stats', error);
    }
  };

  const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('Fetching dashboard data with token:', token);
    
    // Fetch mother profile
    try {
      const motherResponse = await fetch(`${baseUrl}/api/mother/profile`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Mother profile response status:', motherResponse.status);
      
      if (motherResponse.ok) {
        const motherData = await motherResponse.json();
        console.log('Mother profile data received:', motherData);
        
        // Debug: Check the structure of motherData
        console.log('Mother profile structure:', {
          hasId: !!motherData._id,
          hasFullName: !!motherData.fullName,
          keys: Object.keys(motherData)
        });
        
        setMotherProfile(motherData);
      } else if (motherResponse.status === 404) {
        console.log('Mother profile not found');
        setError('Mother profile not found. Please complete your profile first.');
      } else {
        const errorData = await motherResponse.json();
        console.error('Mother profile error:', errorData);
        setError(`Failed to load profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching mother profile:', error);
      setError('Network error while fetching profile');
    }

    // Fetch children
    try {
      const childrenResponse = await fetch(`${baseUrl}/api/mother/children`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Children response status:', childrenResponse.status);
      
      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        console.log('Children data received:', childrenData);
        setChildren(childrenData);
      } else {
        const errorData = await childrenResponse.json();
        console.error('Children fetch error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setError('Failed to load dashboard data');
    toast({
      title: "Error",
      description: "Failed to load dashboard data",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    setFetchingData(false);
  }
};

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Heart },
    { id: 'mood', label: 'Mood Tracking', icon: Heart },
    { id: 'screening', label: 'Child Screening', icon: Brain },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'forum', label: 'Community', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'consultation', label: 'Consult Doctors', icon: User },
    { id: 'neuroai', label: 'Ask NeuroAI', icon: Brain },
    { id: 'reports', label: 'Reports', icon: Users },
  
  ];

const renderContent = () => {
  switch (activeTab) {
    case 'mood':
      return <MoodTracker motherProfile={motherProfile} />;
    case 'screening':
      return <ChildScreening children={children} />;
    case 'timeline':
      return <Timeline motherProfile={motherProfile} children={children} />;
    case 'forum':
      return <Forum />;
    case 'profile':
      return <Profile onProfileUpdate={fetchDashboardData} />;
    case 'consultation':
      return <DoctorConsultation />;
    case 'reports':
      // Add null check and loading state
      if (!motherProfile) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        );
      }
      return <MaternalSelfReports motherId={motherProfile._id} />;
    case 'neuroai':
      return <NeuroAIChat motherProfile={motherProfile} />;
    default:
      return (
        <DashboardOverview 
          motherProfile={motherProfile} 
          children={children} 
          loading={loading}  
          averageMood={averageMood}
          totalCheckIns={totalCheckIns}
          moodHistory={moodHistory}
        />
      );
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-pink-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NeuroNurture
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
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          menuItems={menuItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-4 lg:p-8 lg:ml-64 flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardOverview = ({ motherProfile, children, loading, averageMood, totalCheckIns, moodHistory }: any) => {
  const moods = [
    { value: 1, label: 'Very Sad' },
    { value: 2, label: 'Sad' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Happy' },
    { value: 5, label: 'Very Happy' }
  ];

  

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  const totalScreenings = children.reduce((total: number, child: any) => total + (child.screeningHistory?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back{motherProfile?.fullName ? `, ${motherProfile.fullName}` : ''}!
          </h1>
          <p className="text-gray-600">Here's how your journey is progressing</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <Bell className="h-4 w-4 mr-2" />
          View Reminders
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100">Mood Score</p>
                <p className="text-3xl font-bold">
                  {averageMood > 0 ? `${averageMood.toFixed(1)}/5` : 'No data'}
                </p>
              </div>
              <Heart className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
  <CardContent className="p-6 flex flex-col items-center gap-4">
    <Button
      // onClick={handleGenerateMotherReport} // define this function
      className="w-[126%] text-sm bg-white text-purple-700 font-semibold hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500"
    >
      Generate Mother Health Report
    </Button>
    <Button
      // onClick={handleGenerateChildReport} // define this function
      className="w-[126%] bg-white text-purple-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-indigo-500 font-semibold hover:bg-gray-100"
    >
      Generate Child Screening Report
    </Button>
  </CardContent>
        </Card>


        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Check-ins</p>
                <p className="text-3xl font-bold">{totalCheckIns}</p>
              </div>
              <Calendar className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Children</p>
                <p className="text-3xl font-bold">{children.length}</p>
              </div>
              <MessageSquare className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Mood Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {moodHistory && moodHistory.length > 0 ? (
              <div className=" h-60">
                <ResponsiveContainer width="100%" height="95%">
                  <LineChart data={moodHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis domain={[1, 5]} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      formatter={(value: any, name: string) => [
                        `Mood: ${value}/5 (${moods.find(m => m.value === value)?.label || 'Unknown'})`,
                        ''
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#ec4899" 
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Start Your Mood Journey</h3>
                <p className="text-gray-500">Record your first mood check-in to see trends and insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Children</CardTitle>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child: any) => (
                  <div key={child._id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="font-medium">{child.fullName}</p>
                      <p className="text-sm text-gray-600">
                        Age: {Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No children added yet. Add your first child in the Profile section!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;