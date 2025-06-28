import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Heart, Brain, Bell, CheckCircle } from 'lucide-react';

interface TimelineProps {
  motherProfile?: any;
  children?: any[];
}

const Timeline = ({ motherProfile, children = [] }: TimelineProps) => {
  const [timelineData, setTimelineData] = useState([
    {
      id: 1,
      title: 'Daily Mood Check-in',
      description: 'Time for your daily mental health check-in',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      type: 'reminder',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      completed: false
    },
    {
      id: 2,
      title: children.length > 0 ? `${children[0].fullName}'s Development Screening` : "Child's Development Screening",
      description: 'Recommended quarterly screening for learning assessment',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      type: 'screening',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      completed: false
    },
    {
      id: 3,
      title: 'Prenatal Checkup',
      description: 'Regular checkup with your healthcare provider',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      type: 'appointment',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      completed: false
    },
    {
      id: 4,
      title: 'Meditation Session',
      description: 'Weekly guided meditation for stress relief',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: 'wellness',
      icon: Heart,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      completed: false
    }
  ]);

  const markAsCompleted = (id: number) => {
    setTimelineData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: true } : item
      )
    );
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTimeFromNow = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const upcomingItems = timelineData.filter(item => !item.completed).sort((a, b) => a.date.getTime() - b.date.getTime());
  const completedItems = timelineData.filter(item => item.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Your Timeline</h1>
          <p className="text-gray-600">Stay on top of your health and wellness journey</p>
        </div>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <Bell className="h-4 w-4 mr-2" />
          Set Reminder
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{upcomingItems.length}</div>
            <div className="text-pink-100">Upcoming</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedItems.length}</div>
            <div className="text-green-100">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {timelineData.filter(item => 
                item.date.toDateString() === new Date().toDateString()
              ).length}
            </div>
            <div className="text-blue-100">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Upcoming
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming items</p>
            ) : (
              upcomingItems.map((item) => (
                <div key={item.id} className={`flex items-center gap-4 p-4 rounded-lg ${item.bgColor} border-l-4 border-current ${item.color}`}>
                  <div className={`p-2 rounded-full bg-white ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{formatDate(item.date)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getTimeFromNow(item.date) === 'Today' ? 'bg-red-100 text-red-700' :
                        getTimeFromNow(item.date) === 'Tomorrow' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {getTimeFromNow(item.date)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsCompleted(item.id)}
                    className="border-gray-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Recently Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-green-50 opacity-75">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-700 line-through">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{formatDate(item.date)}</p>
                  </div>
                  
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🌅 Morning Routine</h4>
              <p className="text-blue-700 text-sm">Start your day with 5 minutes of deep breathing to set a positive tone.</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">👶 Child Development</h4>
              <p className="text-purple-700 text-sm">Reading to your child for 15 minutes daily can significantly boost language development.</p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-medium text-pink-800 mb-2">💝 Self-Care</h4>
              <p className="text-pink-700 text-sm">Remember, taking care of yourself is taking care of your family too.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timeline;
