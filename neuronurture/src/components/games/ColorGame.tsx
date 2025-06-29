
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface ColorGameProps {
  onComplete?: (results: any) => void;
  childId: string;
}

const ColorGame = ({ onComplete, childId }: ColorGameProps) => {

  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [pattern, setPattern] = useState<string[]>([]);
  const [userPattern, setUserPattern] = useState<string[]>([]);
  const [showing, setShowing] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  interface ColorGameProps {
  onComplete?: (results: any) => void;
  childId: string;
}

  const colors = [
    { id: 'red', color: 'bg-red-500', hover: 'hover:bg-red-600' },
    { id: 'blue', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { id: 'green', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    { id: 'yellow', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
    { id: 'purple', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    { id: 'orange', color: 'bg-orange-500', hover: 'hover:bg-orange-600' }
  ];

  const generatePattern = (length: number) => {
    const newPattern = [];
    for (let i = 0; i < length; i++) {
      newPattern.push(colors[Math.floor(Math.random() * colors.length)].id);
    }
    return newPattern;
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setUserPattern([]);
    setFeedback(null);
    nextRound();
  };

  const nextRound = () => {
    const patternLength = Math.min(3 + Math.floor(currentRound / 3), 8);
    const newPattern = generatePattern(patternLength);
    setPattern(newPattern);
    setUserPattern([]);
    setShowing(true);
    setFeedback(null);

    // Show pattern for a duration based on length
    setTimeout(() => {
      setShowing(false);
    }, 1000 + (patternLength * 500));
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState('complete');
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (currentRound > 0 && !showing && pattern.length > 0) {
      // Check if user completed the pattern
      if (userPattern.length === pattern.length) {
        const isCorrect = userPattern.every((color, index) => color === pattern[index]);
        
        if (isCorrect) {
          setFeedback('correct');
          setScore(score + (pattern.length * 10) + (streak * 5));
          setStreak(streak + 1);
          
          setTimeout(() => {
            setCurrentRound(currentRound + 1);
            nextRound();
          }, 1500);
        } else {
          setFeedback('incorrect');
          setStreak(0);
          
          setTimeout(() => {
            setCurrentRound(currentRound + 1);
            nextRound();
          }, 2000);
        }
      }
    }
  }, [userPattern, pattern, showing, currentRound, score, streak]);

  const handleColorClick = (colorId: string) => {
    if (showing || userPattern.length >= pattern.length) return;
    
    setUserPattern([...userPattern, colorId]);
  };

  const getResults = () => {
    const totalTime = 180 - timeLeft;
    const roundsCompleted = currentRound - 1;
    const accuracy = roundsCompleted > 0 ? (score / (roundsCompleted * 50)) * 100 : 0;
    
    return {
      gameType: 'color-pattern',
      score,
      roundsCompleted,
      maxStreak: streak,
      timeSpent: totalTime,
      accuracy: Math.round(accuracy),
      completed: true
    };
  };

  const handleSave = async () => {
  const results = getResults();

  const screeningData = {
    gameType: 'colorPattern',  // Backend expects this field
    gameData: {
      totalScore: results.score,
      roundsCompleted: results.roundsCompleted,
      bestStreak: results.maxStreak,
      timeUsed: results.timeSpent,
      mentalCheck: 'low' // Can adjust based on score
    }
  };

  try {
    const response = await fetch(`${baseUrl}/api/child/screening/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(screeningData)
    });

    const res = await response.json();
    console.log('Saved Color Pattern:', res);
    alert('Color Pattern results saved!');
  } catch (err) {
    console.error('Error saving color results:', err);
    alert('Failed to save results.');
  }
};


  if (gameState === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-3xl mb-6 inline-block">
            <Target className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Color Pattern Game</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Watch the color sequence carefully, then repeat it back! This game helps assess visual memory, 
            attention to detail, and sequential processing abilities.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-blue-800 mb-2">How to Play:</h3>
            <ul className="text-left text-blue-700 space-y-1">
              <li>• Watch the color pattern light up</li>
              <li>• Click the colors in the same order</li>
              <li>• Patterns get longer as you progress</li>
              <li>• Build streaks for bonus points!</li>
            </ul>
          </div>

          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 text-lg"
          >
            Start Playing!
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'complete') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-3xl mb-6 inline-block">
            <Target className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Excellent Work!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-blue-700">Total Score</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentRound - 1}</div>
              <div className="text-green-700">Rounds Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{streak}</div>
              <div className="text-purple-700">Best Streak</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{180 - timeLeft}s</div>
              <div className="text-orange-700">Time Used</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={startGame}
              variant="outline"
              className="border-blue-200 text-blue-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              Save Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-blue-600">Round {currentRound}</div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-green-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-purple-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-lg font-bold text-orange-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        
        <Progress value={(userPattern.length / pattern.length) * 100} className="flex-1 max-w-xs" />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${
          feedback === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {feedback === 'correct' ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <span className="font-medium">
            {feedback === 'correct' ? 'Correct! Great memory!' : 'Oops! Try to remember the pattern.'}
          </span>
        </div>
      )}

      {/* Game Status */}
      <div className="text-center">
        {showing ? (
          <div className="text-xl font-medium text-gray-700">
            Watch the pattern... (Pattern length: {pattern.length})
          </div>
        ) : (
          <div className="text-xl font-medium text-gray-700">
            Click the colors in order ({userPattern.length}/{pattern.length})
          </div>
        )}
      </div>

      {/* Color Grid */}
      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6">
            {colors.map((color, index) => (
              <button
                key={color.id}
                className={`
                  aspect-square rounded-full transition-all duration-300 transform
                  ${color.color} ${color.hover}
                  ${showing && pattern[userPattern.length] === color.id ? 'scale-110 ring-4 ring-white shadow-xl' : ''}
                  ${!showing ? 'hover:scale-105 active:scale-95' : 'cursor-default'}
                  shadow-lg
                `}
                onClick={() => handleColorClick(color.id)}
                disabled={showing}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pattern Display */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center mb-3">
            <span className="text-sm font-medium text-gray-600">Your Progress:</span>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            {pattern.map((colorId, index) => {
              const color = colors.find(c => c.id === colorId);
              const isUserInput = index < userPattern.length;
              const isCorrect = isUserInput && userPattern[index] === colorId;
              
              return (
                <div
                  key={index}
                  className={`
                    w-6 h-6 rounded-full border-2 
                    ${isUserInput 
                      ? (isCorrect ? color?.color + ' border-green-300' : 'bg-red-500 border-red-300')
                      : 'bg-gray-200 border-gray-300'
                    }
                  `}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorGame;
