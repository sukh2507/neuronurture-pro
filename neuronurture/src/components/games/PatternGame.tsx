
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface PatternGameProps {
  onComplete?: (results: any) => void;
  childId: string;
}


const PatternGame = ({ onComplete, childId }: PatternGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  

  const shapes = ['●', '■', '▲', '♦', '★', '◆'];
  const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500'];

  const generatePattern = (level: number) => {
    const patternLength = Math.min(3 + level, 6);
    const pattern = [];
    
    for (let i = 0; i < patternLength; i++) {
      pattern.push({
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    // Create the next item based on a simple rule
    const lastItem = pattern[pattern.length - 1];
    const nextItem = {
      shape: shapes[(shapes.indexOf(lastItem.shape) + 1) % shapes.length],
      color: colors[(colors.indexOf(lastItem.color) + 1) % colors.length]
    };
    
    // Generate wrong answers
    const options = [nextItem];
    while (options.length < 4) {
      const wrongOption = {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      
      if (!options.some(opt => opt.shape === wrongOption.shape && opt.color === wrongOption.color)) {
        options.push(wrongOption);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      sequence: pattern,
      correctAnswer: 0, // Will be updated after shuffling
      options: options
    };
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(1);
    setScore(0);
    setCorrectAnswers(0);
    generateNewPattern();
  };

  const generateNewPattern = () => {
    const newPattern = generatePattern(currentLevel);
    // Find correct answer index after shuffling
    newPattern.correctAnswer = newPattern.options.findIndex(option => 
      option.shape === newPattern.options[0].shape && option.color === newPattern.options[0].color
    );
    setPatterns([newPattern]);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState('complete');
    }
  }, [timeLeft, gameState]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const currentPattern = patterns[0];
    const isCorrect = answerIndex === currentPattern.correctAnswer;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(score + (currentLevel * 10));
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setFeedback('incorrect');
    }
    
    setTimeout(() => {
      if (currentLevel >= 10) {
        setGameState('complete');
      } else {
        setCurrentLevel(currentLevel + 1);
        generateNewPattern();
      }
    }, 2000);
  };

  const getResults = () => {
    const totalTime = 300 - timeLeft;
    const accuracy = currentLevel > 1 ? (correctAnswers / (currentLevel - 1)) * 100 : 0;
    
    return {
      gameType: 'pattern-sequence',
      score,
      levelsCompleted: currentLevel - 1,
      correctAnswers,
      timeSpent: totalTime,
      accuracy: Math.round(accuracy),
      completed: currentLevel >= 10
    };
  };

  const handleSave = async () => {
  const results = getResults();

  const screeningData = {
    shapeSequence: {
      totalScore: results.score,
      levelsCompleted: results.levelsCompleted,
      correctAnswers: results.correctAnswers,
      timeUsed: results.timeSpent,
      mentalCheck: 'high' // You can adjust this based on accuracy or score
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
    console.log('Saved Shape Sequence:', res);
    alert('Shape Sequence results saved!');
  } catch (err) {
    console.error('Error saving pattern results:', err);
    alert('Failed to save results.');
  }
};


  if (gameState === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-3xl mb-6 inline-block">
            <Zap className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shape Sequence Game</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Look at the pattern and figure out what comes next! This game helps assess logical thinking, 
            pattern recognition, and sequential reasoning abilities.
          </p>
          
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-green-800 mb-2">How to Play:</h3>
            <ul className="text-left text-green-700 space-y-1">
              <li>• Study the sequence of shapes and colors</li>
              <li>• Find the pattern in the sequence</li>
              <li>• Choose what should come next</li>
              <li>• Progress through 10 challenging levels!</li>
            </ul>
          </div>

          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 text-lg"
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
            <Zap className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Fantastic Thinking!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-green-700">Total Score</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentLevel - 1}</div>
              <div className="text-blue-700">Levels Completed</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{correctAnswers}</div>
              <div className="text-purple-700">Correct Answers</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{300 - timeLeft}s</div>
              <div className="text-orange-700">Time Used</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={startGame}
              variant="outline"
              className="border-green-200 text-green-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              Save Results
            </Button>

          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPattern = patterns[0];

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-green-600">Level {currentLevel}</div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-purple-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-lg font-bold text-orange-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        
        <Progress value={(currentLevel / 10) * 100} className="flex-1 max-w-xs" />
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
            {feedback === 'correct' ? 'Excellent pattern recognition!' : 'Look more carefully at the pattern.'}
          </span>
        </div>
      )}

      {/* Pattern Sequence */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">What comes next in this sequence?</h3>
            <p className="text-gray-600">Study the pattern carefully</p>
          </div>
          
          <div className="flex justify-center items-center gap-4 mb-8">
            {currentPattern.sequence.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`text-6xl ${item.color} mb-2`}>
                  {item.shape}
                </div>
                <div className="text-sm text-gray-500">#{index + 1}</div>
              </div>
            ))}
            
            <div className="text-4xl text-gray-400 mx-4">→</div>
            
            <div className="flex flex-col items-center">
              <div className="text-6xl text-gray-300 mb-2">?</div>
              <div className="text-sm text-gray-500">#{currentPattern.sequence.length + 1}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <Card>
        <CardContent className="p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4 text-center">Choose the correct answer:</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentPattern.options.map((option, index) => (
              <button
                key={index}
                className={`
                  p-6 border-2 rounded-lg transition-all duration-300 flex flex-col items-center
                  ${selectedAnswer === index 
                    ? (index === currentPattern.correctAnswer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }
                  ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                `}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <div className={`text-4xl ${option.color} mb-2`}>
                  {option.shape}
                </div>
                <div className="text-sm text-gray-500">Option {index + 1}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternGame;
