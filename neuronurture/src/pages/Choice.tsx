
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Baby, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

const Choice = () => {
  const navigate = useNavigate();

  const handleChoice = async (choice: 'wellbeing' | 'child-screening') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/mother/choice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ choice }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Welcome!",
          description: "Let's get started on your journey.",
        });
        
        if (choice === 'wellbeing') {
          navigate('/dashboard/mental-health');
        } else {
          navigate('/dashboard/child-screening');
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NeuroNurture
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            How can we
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> support </span>
            you today?
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the area where you'd like to focus your journey. You can always access both features later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white cursor-pointer overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                <Heart className="h-12 w-12 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Mental Health & Wellbeing
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                Track your mood, access meditation resources, connect with professionals, 
                and get support during pregnancy or postpartum journey.
              </p>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingUp className="h-4 w-4 text-pink-500" />
                  <span>Daily mood tracking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Meditation & relaxation</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span>Professional support</span>
                </div>
              </div>

              <Button 
                onClick={() => handleChoice('wellbeing')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                size="lg"
              >
                Focus on My Wellbeing
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white cursor-pointer overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                <Brain className="h-12 w-12 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Child Development Screening
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                Interactive games to assess your child's development, early screening for learning 
                differences, and personalized recommendations.
              </p>

              <div className="space-y-2 mb-6 text-left">
                <div className="flex items-center gap-2 text-gray-700">
                  <Baby className="h-4 w-4 text-purple-500" />
                  <span>Fun screening games</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Early detection tools</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span>Progress tracking</span>
                </div>
              </div>

              <Button 
                onClick={() => handleChoice('child-screening')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                size="lg"
              >
                Screen My Child
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't worry, you can access both features anytime from your dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default Choice;
