
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, RotateCcw, CheckCircle, XCircle, Volume2 } from 'lucide-react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface ReadingGameProps {
  onComplete?: (results: any) => void;
  childId: string;
}

const ReadingGame = ({ onComplete, childId }: ReadingGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const questions = [
    {
      type: 'word-recognition',
      question: 'Which word matches the picture?',
      image: '🐱',
      options: ['cat', 'dog', 'bird', 'fish'],
      correct: 0
    },
    {
      type: 'phonics',
      question: 'What sound does "B" make?',
      options: ['buh', 'kuh', 'duh', 'puh'],
      correct: 0
    },
    {
      type: 'rhyming',
      question: 'Which word rhymes with "cat"?',
      options: ['hat', 'dog', 'sun', 'tree'],
      correct: 0
    },
    {
      type: 'sight-words',
      question: 'Find the word "the"',
      options: ['cat', 'the', 'run', 'big'],
      correct: 1
    },
    {
      type: 'letter-recognition',
      question: 'Which letter comes after "M"?',
      options: ['L', 'N', 'O', 'K'],
      correct: 1
    },
    {
      type: 'word-building',
      question: 'What word do these letters make: C-A-R?',
      options: ['cat', 'car', 'can', 'cup'],
      correct: 1
    },
    {
      type: 'comprehension',
      question: 'The cat is sleeping. What is the cat doing?',
      options: ['running', 'eating', 'sleeping', 'playing'],
      correct: 2
    },
    {
      type: 'sequence',
      question: 'Put these in ABC order: B, A, C',
      options: ['B, A, C', 'A, B, C', 'C, B, A', 'A, C, B'],
      correct: 1
    }
  ];

  
  const startGame = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
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
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setFeedback('incorrect');
    }
    
    setTimeout(() => {
      if (currentQuestion >= questions.length - 1) {
        setGameState('complete');
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      }
    }, 2000);
  };

  const playSound = (text: string) => {
    // In a real implementation, you would use Web Speech API or audio files
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const getResults = () => {
    const totalTime = 900 - timeLeft;
    const accuracy = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    
    return {
      gameType: 'reading-skills',
      score,
      questionsAnswered: currentQuestion + 1,
      correctAnswers,
      timeSpent: totalTime,
      accuracy: Math.round(accuracy),
      completed: currentQuestion >= questions.length - 1
    };
  };

  const handleSave = async () => {
  const results = getResults();

  const screeningData = {
    wordAdventure: {
      totalScore: results.score,
      accuracy: results.accuracy,
      correctPatternsFound: results.correctAnswers,
      timeUsed: results.timeSpent,
      mentalCheck: 'moderate' // You can adjust based on score or accuracy
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
    console.log('Saved Word Adventure:', res);
    alert('Word Adventure results saved!');
  } catch (err) {
    console.error('Error saving reading results:', err);
    alert('Failed to save results.');
  }
};


  if (gameState === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-3xl mb-6 inline-block">
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Word Adventures</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Embark on a reading adventure! This game helps assess early reading skills, phonological awareness, 
            and comprehension abilities through fun, interactive questions.
          </p>
          
          <div className="bg-orange-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-orange-800 mb-2">What We'll Practice:</h3>
            <ul className="text-left text-orange-700 space-y-1">
              <li>• Letter and word recognition</li>
              <li>• Phonics and sounds</li>
              <li>• Reading comprehension</li>
              <li>• Rhyming and patterns</li>
            </ul>
          </div>

          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 text-lg"
          >
            Start Adventure!
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
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Reading Superstar!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{score}</div>
              <div className="text-orange-700">Total Score</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-green-700">Correct Answers</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round((correctAnswers / questions.length) * 100)}%</div>
              <div className="text-blue-700">Accuracy</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{Math.floor((900 - timeLeft) / 60)}m</div>
              <div className="text-purple-700">Time Used</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={startGame}
              variant="outline"
              className="border-orange-200 text-orange-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              Save Results
            </Button>

          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-orange-600">{currentQuestion + 1}/{questions.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-green-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-blue-600">{correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <div className="text-lg font-bold text-purple-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="flex-1 max-w-xs" />
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
            {feedback === 'correct' ? 'Great reading!' : 'Keep practicing!'}
          </span>
        </div>
      )}

      {/* Question */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{question.question}</h3>
            <Button
              variant="outline"
              size="icon"
              onClick={() => playSound(question.question)}
              className="border-orange-200 text-orange-600"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          {question.image && (
            <div className="text-8xl mb-6">{question.image}</div>
          )}
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`
                  p-6 border-2 rounded-lg transition-all duration-300 text-xl font-medium
                  ${selectedAnswer === index 
                    ? (index === question.correct ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                  }
                  ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                `}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Type Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <span className="text-sm font-medium text-gray-600 bg-orange-100 px-3 py-1 rounded-full">
              {question.type.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingGame;
