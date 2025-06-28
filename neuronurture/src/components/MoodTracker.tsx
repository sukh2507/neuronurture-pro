import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Heart, TrendingUp, Calendar, Mic, MicOff, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface MoodTrackerProps {
  motherProfile?: any;
}

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

const MoodTracker = ({ motherProfile }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodStats, setMoodStats] = useState<MoodTrackingData>({
    moodData: [],
    moodNotes: [],
    moodLogs: [],
    averageMood: 0,
    numberOfMoodTracking: 0,
    happyDays: 0
  });

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Sad', color: 'text-red-500' },
    { value: 2, emoji: '😔', label: 'Sad', color: 'text-orange-500' },
    { value: 3, emoji: '😐', label: 'Neutral', color: 'text-yellow-500' },
    { value: 4, emoji: '😊', label: 'Happy', color: 'text-green-500' },
    { value: 5, emoji: '😍', label: 'Very Happy', color: 'text-pink-500' },
  ];

  // Fetch mood data on component mount
  useEffect(() => {
    fetchMoodData();
  }, []);

  // Fallback to motherProfile data if API fails
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

  const fetchMoodData = async () => {
    try {
      setFetchingData(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('No auth token found');
        setError('Please log in to access mood tracking');
        return;
      }

      console.log('Fetching mood data...');
      const response = await fetch(`${baseUrl}/api/mood/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received data:', data);
        
        const moodTracking = data.moodTracking || {
          moodData: [],
          moodNotes: [],
          moodLogs: [],
          averageMood: 0,
          numberOfMoodTracking: 0,
          happyDays: 0
        };

        setMoodStats(moodTracking);
        
        // Format mood logs for the chart
        if (moodTracking.moodLogs && moodTracking.moodLogs.length > 0) {
          const formattedHistory = moodTracking.moodLogs.map((log: any) => ({
            date: new Date(log.date).toISOString().split('T')[0],
            mood: log.mood,
            notes: log.notes
          }));
          setMoodHistory(formattedHistory);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch mood data:', response.status, errorData);
        setError(`Could not load mood history: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching mood data:', error);
      setError('Could not connect to server. Please check your connection.');
    } finally {
      setFetchingData(false);
    }
  };

  const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    // Simple toast replacement - you can replace this with your actual toast implementation
    console.log(`${type.toUpperCase()}: ${title} - ${description}`);
    if (type === 'error') {
      setError(description);
    } else {
      setError(null);
    }
  };

  const handleMoodSubmit = async () => {
    if (selectedMood === null) {
      showToast("Error", "Please select a mood", 'error');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        showToast("Error", "Please log in to save your mood", 'error');
        return;
      }

      console.log('Sending mood data:', { mood: selectedMood, notes });
      
      const response = await fetch(`${baseUrl}/api/mood/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: selectedMood,
          notes: notes,
        }),
      });

      console.log('Mood submit response status:', response.status);
      const responseData = await response.json();
      console.log('Mood submit response data:', responseData);

      if (response.ok) {
        // Update local state with the returned data
        if (responseData.moodTracking) {
          setMoodStats(responseData.moodTracking);
          
          // Format mood logs for the chart
          const formattedHistory = responseData.moodTracking.moodLogs.map((log: any) => ({
            date: new Date(log.date).toISOString().split('T')[0],
            mood: log.mood,
            notes: log.notes
          }));
          setMoodHistory(formattedHistory);
        }
        
        // Reset form
        setSelectedMood(null);
        setNotes('');
        
        showToast("Success", "Mood check-in saved successfully");
      } else {
        throw new Error(responseData.error || 'Failed to submit mood');
      }
    } catch (error) {
      console.error('Error submitting mood:', error);
      showToast("Error", "Failed to save mood check-in", 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording logic here
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setNotes(notes + ' ' + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          showToast("Error", "Speech recognition failed. Please try typing instead.", 'error');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        setIsRecording(true);

        setTimeout(() => {
          recognition.stop();
          setIsRecording(false);
        }, 10000);
      } else {
        showToast("Not Supported", "Speech recognition is not supported in your browser", 'error');
      }
    } else {
      setIsRecording(false);
    }
  };

  // Use backend data for calculations
  const averageMood = moodStats.averageMood;
  const totalDaysTracked = moodStats.numberOfMoodTracking;
  const happyDays = moodStats.happyDays;
  const happyPercentage = totalDaysTracked > 0 ? Math.round((happyDays / totalDaysTracked) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mood Tracking</h1>
          <p className="text-gray-600">Track your emotional wellbeing journey</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMoodData}
          disabled={fetchingData}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${fetchingData ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {fetchingData && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading your mood data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Check-in */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            How are you feeling today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300 text-center
                  ${selectedMood === mood.value 
                    ? 'border-pink-400 bg-pink-50 scale-105' 
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                  }
                `}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className={`text-sm font-medium ${mood.color}`}>{mood.label}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Add some notes about your day (optional)
            </label>
            <div className="relative">
              <Textarea
                placeholder="How was your day? What made you feel this way?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="pr-12"
                rows={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {isRecording && (
              <p className="text-sm text-red-600">Recording... Speak now (10 seconds max)</p>
            )}
          </div>

          <Button 
            onClick={handleMoodSubmit}
            disabled={selectedMood === null || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : "Save Today's Check-in"}
          </Button>
        </CardContent>
      </Card>

      {/* Mood Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">
              {averageMood > 0 ? averageMood.toFixed(1) : '0'}/5
            </div>
            <div className="text-gray-600">Average Mood</div>
            <Progress value={(averageMood / 5) * 100} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2 text-green-600">{totalDaysTracked}</div>
            <div className="text-gray-600">Days Tracked</div>
            <div className="flex items-center justify-center mt-4 text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {totalDaysTracked > 0 ? 'Great consistency!' : 'Start tracking!'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2 text-blue-600">{happyDays}</div>
            <div className="text-gray-600">Happy Days</div>
            <div className="text-sm text-blue-600 mt-4">
              {happyPercentage}% positive
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood Chart */}
      {moodHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-500" />
              Mood Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
                      `Mood: ${value}/5 (${moods.find(m => m.value === value)?.label})`,
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
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Start Your Mood Journey</h3>
            <p className="text-gray-500">Record your first mood check-in to see trends and insights</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Mood History */}
      {moodHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moodHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {moods.find(m => m.value === entry.mood)?.emoji}
                    </span>
                    <div>
                      <p className="font-medium">
                        {moods.find(m => m.value === entry.mood)?.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-700 truncate" title={entry.notes}>
                        {entry.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💙 Self-Care Tip</h4>
              <p className="text-blue-700">
                {averageMood >= 4 
                  ? "Your mood has been stable lately. Consider adding a daily 10-minute meditation to boost your wellbeing."
                  : averageMood >= 3
                  ? "Your mood shows some ups and downs. Try establishing a daily routine with activities you enjoy."
                  : averageMood > 0
                  ? "It seems like you've been having some challenging days. Consider reaching out to friends, family, or a professional for support."
                  : "Start tracking your mood to get personalized insights and recommendations."
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🌱 Growth Insight</h4>
              <p className="text-green-700">
                {totalDaysTracked > 0 
                  ? "You've been consistent with tracking! This self-awareness is a powerful tool for mental health."
                  : "Starting to track your mood is the first step towards better mental health awareness. Keep it up!"
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">🔗 Connect</h4>
              <p className="text-purple-700">Join our community forum to share experiences with other mothers on similar journeys.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;