import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Baby, Heart, Settings, Save, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface ProfileProps {
  onProfileUpdate?: () => Promise<void>;
}

const Profile = ({ onProfileUpdate }: ProfileProps) => {
  const [motherProfile, setMotherProfile] = useState({
    fullName: '',
    age: 0,
    pregnancyStage: 'none',
    pregnancyWeeks: 0,
    dueDate: '',
    familySupport: 'good',
    previousMentalHealthHistory: '',
    currentMentalHealthConcerns: []
  });

  const [children, setChildren] = useState<any[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    healthHistory: [],
    learningConcerns: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
    fetchChildren();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/mother/profile`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMotherProfile({
          fullName: data.fullName || '',
          age: data.age || 0,
          pregnancyStage: data.pregnancyStage || 'none',
          pregnancyWeeks: data.pregnancyWeeks || 0,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          familySupport: data.familySupport || 'good',
          previousMentalHealthHistory: data.previousMentalHealthHistory || '',
          currentMentalHealthConcerns: data.currentMentalHealthConcerns || []
        });
      } else if (response.status === 404) {
        console.log('Mother profile not found, will create on save');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/mother/children`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return ageInYears;
  };

  const handleMotherProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Sending mother profile data:', motherProfile);
      
      const response = await fetch(`${baseUrl}/api/mother/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(motherProfile),
      });

      console.log('Mother profile response status:', response.status);
      const responseData = await response.json();
      console.log('Mother profile response data:', responseData);

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
      } else {
        throw new Error(responseData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAddChild = async () => {
  // Validation
  if (!newChild.fullName.trim()) {
    toast({
      title: "Error",
      description: "Please enter the child's full name",
      variant: "destructive",
    });
    return;
  }

  if (!newChild.dateOfBirth) {
    toast({
      title: "Error",
      description: "Please select the child's date of birth",
      variant: "destructive",
    });
    return;
  }

  if (!newChild.gender) {
    toast({
      title: "Error",
      description: "Please select the child's gender",
      variant: "destructive",
    });
    return;
  }

  // Check if date of birth is not in the future
  const birthDate = new Date(newChild.dateOfBirth);
  const today = new Date();
  if (birthDate > today) {
    toast({
      title: "Error",
      description: "Date of birth cannot be in the future",
      variant: "destructive",
    });
    return;
  }

  try {
    setLoading(true); // Add loading state
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    console.log('Sending child data:', newChild);
    
    const response = await fetch(`${baseUrl}/api/child/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: newChild.fullName.trim(),
        dateOfBirth: newChild.dateOfBirth,
        gender: newChild.gender,
        healthHistory: newChild.healthHistory || [],
        learningConcerns: newChild.learningConcerns || []
      }),
    });

    console.log('Child registration response status:', response.status);
    const responseData = await response.json();
    console.log('Child registration response data:', responseData);

    if (response.ok) {
      // Success
      setChildren([...children, responseData.child]);
      setNewChild({ 
        fullName: '', 
        dateOfBirth: '', 
        gender: '', 
        healthHistory: [], 
        learningConcerns: [] 
      });
      setShowAddChild(false);
      
      toast({
        title: "Success",
        description: "Child added successfully",
      });
      
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
    } else {
      // Handle specific error cases
      if (response.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      } else if (response.status === 403) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      } else {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Error adding child:', error);
    toast({
      title: "Error",
      description: error.message || "Failed to add child. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false); // Remove loading state
  }
};

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <Button 
          onClick={handleMotherProfileUpdate}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Mother Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-pink-500" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={motherProfile.fullName}
                onChange={(e) => setMotherProfile({ ...motherProfile, fullName: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={motherProfile.age || ''}
                onChange={(e) => setMotherProfile({ ...motherProfile, age: parseInt(e.target.value) || 0 })}
                placeholder="Enter your age"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pregnancyStage">Pregnancy Stage</Label>
              <Select 
                value={motherProfile.pregnancyStage} 
                onValueChange={(value) => setMotherProfile({ ...motherProfile, pregnancyStage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pregnant">Currently Pregnant</SelectItem>
                  <SelectItem value="postpartum">Postpartum</SelectItem>
                  <SelectItem value="none">Not Pregnant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {motherProfile.pregnancyStage === 'pregnant' && (
              <div>
                <Label htmlFor="pregnancyWeeks">Pregnancy Weeks</Label>
                <Input
                  id="pregnancyWeeks"
                  type="number"
                  value={motherProfile.pregnancyWeeks || ''}
                  onChange={(e) => setMotherProfile({ ...motherProfile, pregnancyWeeks: parseInt(e.target.value) || 0 })}
                  placeholder="Weeks pregnant"
                />
              </div>
            )}
          </div>

          {motherProfile.pregnancyStage === 'pregnant' && (
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={motherProfile.dueDate}
                onChange={(e) => setMotherProfile({ ...motherProfile, dueDate: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="familySupport">Family Support Level</Label>
            <Select 
              value={motherProfile.familySupport} 
              onValueChange={(value) => setMotherProfile({ ...motherProfile, familySupport: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mentalHealthHistory">Previous Mental Health History</Label>
            <Textarea
              id="mentalHealthHistory"
              value={motherProfile.previousMentalHealthHistory}
              onChange={(e) => setMotherProfile({ ...motherProfile, previousMentalHealthHistory: e.target.value })}
              placeholder="Any previous mental health experiences or diagnoses..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Children Profiles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-6 w-6 text-purple-500" />
              Children
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowAddChild(true)}
              className="border-purple-200 text-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.map((child) => (
            <div key={child._id} className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{child.fullName}</h3>
                <span className="text-sm text-gray-600">Age: {calculateAge(child.dateOfBirth)} years</span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>
                  <span className="ml-2 capitalize">{child.gender}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Birth Date:</span>
                  <span className="ml-2">{new Date(child.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Screenings:</span>
                  <span className="ml-2 text-purple-600">{child.screeningHistory?.length || 0} completed</span>
                </div>
              </div>
            </div>
          ))}

          {children.length === 0 && !showAddChild && (
            <div className="p-8 text-center text-gray-500">
              <Baby className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No children added yet</p>
              <p className="text-sm">Click "Add Child" to get started</p>
            </div>
          )}

          {/* Add Child Form */}
          {showAddChild && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Child</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddChild(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="childName">Full Name</Label>
                    <Input
                      id="childName"
                      value={newChild.fullName}
                      onChange={(e) => setNewChild({ ...newChild, fullName: e.target.value })}
                      placeholder="Child's full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="childBirthDate">Date of Birth</Label>
                    <Input
                      id="childBirthDate"
                      type="date"
                      value={newChild.dateOfBirth}
                      onChange={(e) => setNewChild({ ...newChild, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={newChild.gender} onValueChange={(value) => setNewChild({ ...newChild, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleAddChild} className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    Add Child
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddChild(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-gray-500" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Daily Mood Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded to log your daily mood</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Screening Reminders</h4>
              <p className="text-sm text-gray-600">Get notified about child development screenings</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Community Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates from forum discussions</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Anonymous Mode</h4>
              <p className="text-sm text-gray-600">Default to anonymous posting in forums</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
