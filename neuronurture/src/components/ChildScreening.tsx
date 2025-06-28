import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, GamepadIcon, Clock, Star, Target, Zap } from 'lucide-react';
import MemoryGame from '@/components/games/MemoryGame';
import ColorGame from '@/components/games/ColorGame';
import PatternGame from '@/components/games/PatternGame';
import ReadingGame from '@/components/games/ReadingGame';

interface ChildScreeningProps {
  children?: any[];
}

const ChildScreening = ({ children = [] }: ChildScreeningProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [childProfile, setChildProfile] = useState({
    name: children.length > 0 ? children[0].fullName : 'Child',
    age: children.length > 0 ? Math.floor((Date.now() - new Date(children[0].dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 4,
    lastScreening: '2 weeks ago'
  });

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test working memory and attention skills through card matching',
      difficulty: 'Easy',
      duration: '5-10 min',
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      component: MemoryGame
    },
    {
      id: 'color',
      title: 'Color Patterns',
      description: 'Assess visual processing and pattern recognition abilities',
      difficulty: 'Medium',
      duration: '10-15 min',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      component: ColorGame
    },
    {
      id: 'pattern',
      title: 'Shape Sequences',
      description: 'Evaluate logical thinking and sequence completion skills',
      difficulty: 'Medium',
      duration: '8-12 min',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      component: PatternGame
    },
    {
      id: 'reading',
      title: 'Word Adventures',
      description: 'Screen for early reading skills and phonological awareness',
      difficulty: 'Easy',
      duration: '15-20 min',
      icon: Star,
      color: 'from-orange-500 to-amber-500',
      component: ReadingGame
    }
  ];

  
  const handleGameComplete = (gameId: string, results: any) => {
    console.log(`Game ${gameId} completed with results:`, results);
    // Here you would send results to backend
    setSelectedGame(null);
  };

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      const childId = children?.[0]?._id;
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedGame(null)}
              className="border-pink-200"
            >
              ← Back to Games
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">{game.title}</h1>
          </div>
          <GameComponent 
            onComplete={(results: any) => handleGameComplete(selectedGame, results)} 
            childId={childId}
          />

        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Child Development Screening</h1>
          <p className="text-gray-600">Fun games to assess {childProfile.name}'s development</p>
        </div>
      </div>

      {/* Child Profile Card */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{childProfile.name}'s Profile</h3>
              <p className="text-gray-600">Age: {childProfile.age} years • Last screening: {childProfile.lastScreening}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">4/5</div>
              <div className="text-sm text-gray-600">Games Completed</div>
            </div>
          </div>
          <Progress value={80} className="mt-4" />
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white">
            <CardContent className="p-6">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${game.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <game.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
              <p className="text-gray-600 mb-4">{game.description}</p>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {game.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {game.difficulty}
                </div>
              </div>
              
              <Button 
                className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg text-white`}
                onClick={() => setSelectedGame(game.id)}
              >
                <GamepadIcon className="h-4 w-4 mr-2" />
                Start Game
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium">Memory Match - Completed</h4>
                <p className="text-sm text-gray-600">Excellent working memory skills</p>
              </div>
              <div className="text-green-600 font-bold">Low Risk</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium">Color Patterns - Completed</h4>
                <p className="text-sm text-gray-600">Good visual processing abilities</p>
              </div>
              <div className="text-blue-600 font-bold">Low Risk</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium">Word Adventures - In Progress</h4>
                <p className="text-sm text-gray-600">Some challenges with phonological awareness</p>
              </div>
              <div className="text-yellow-600 font-bold">Monitor</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildScreening;
