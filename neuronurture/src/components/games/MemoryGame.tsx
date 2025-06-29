
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Star, Clock, RotateCcw } from 'lucide-react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface MemoryGameProps {
  onComplete: (results: any) => void;
    childId: string;

}

const MemoryGame = ({ onComplete, childId }: MemoryGameProps) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro');
  const [cards, setCards] = useState<Array<{id: number, value: string, isFlipped: boolean, isMatched: boolean}>>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [score, setScore] = useState(0);

  const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  interface MemoryGameProps {
  onComplete?: (results: any) => void;
  childId: string;
}

  const initializeGame = () => {
    const gameCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        value: emoji,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setGameState('playing');
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
    if (matches === emojis.length) {
      const finalScore = Math.max(0, 1000 - (moves * 10) - (120 - timeLeft) * 5);
      setScore(finalScore);
      setGameState('complete');
    }
  }, [matches, moves, timeLeft, emojis.length]);

  const flipCard = (cardId: number) => {
    if (selectedCards.length >= 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves(moves + 1);
      
      const [first, second] = newSelected;
      if (cards[first].value === cards[second].value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(matches + 1);
          setSelectedCards([]);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const getResults = () => {
    const totalTime = 120 - timeLeft;
    const accuracy = matches > 0 ? (matches / moves) * 100 : 0;
    
    return {
      gameType: 'memory',
      score,
      moves,
      matches,
      timeSpent: totalTime,
      accuracy: Math.round(accuracy),
      completed: matches === emojis.length
    };
  };

const handleSave = async () => {
  const results = getResults();

  // FIXED: Structure data to match backend expectations
  const screeningData = {
    gameType: 'memoryMatch',  // Backend expects this field
    gameData: {               // Backend expects this field
      finalScore: results.score,
      totalMoves: results.moves,
      pairsFound: results.matches,
      timeUsed: results.timeSpent,
      mentalCheck: 'dyslexia'
    }
  };

  console.log('Saving data to backend...');
  console.log('childId:', childId);
  console.log('screeningData:', screeningData);

  try {
    const response = await fetch(`${baseUrl}/api/child/screening/${childId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(screeningData)
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response JSON:', result);

    if (!response.ok) {
      throw new Error(result.message || 'Unknown server error');
    }

    alert('Memory Match results saved!');
  } catch (err) {
    console.error('Save failed:', err);
    alert('Failed to save results.');
  }
};



  if (gameState === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-3xl mb-6 inline-block">
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Memory Match Game</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Help your child find matching pairs of adorable animals! This game helps assess working memory, 
            attention span, and visual processing skills. Click on cards to flip them and find matching pairs.
          </p>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-purple-800 mb-2">How to Play:</h3>
            <ul className="text-left text-purple-700 space-y-1">
              <li>• Click on any card to flip it over</li>
              <li>• Try to find two cards with the same animal</li>
              <li>• Match all pairs before time runs out</li>
              <li>• Fewer moves = higher score!</li>
            </ul>
          </div>

          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-3 text-lg"
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
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Great Job!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{score}</div>
              <div className="text-purple-700">Final Score</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-blue-700">Total Moves</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{matches}</div>
              <div className="text-green-700">Pairs Found</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{120 - timeLeft}s</div>
              <div className="text-orange-700">Time Used</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button 
              onClick={initializeGame}
              variant="outline"
              className="border-purple-200 text-purple-600"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Play Again
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            >
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
            <div className="text-lg font-bold text-purple-600">{moves}</div>
            <div className="text-sm text-gray-600">Moves</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold text-green-600">{matches}/{emojis.length}</div>
            <div className="text-sm text-gray-600">Pairs</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="text-lg font-bold text-orange-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          </div>
        </div>
        
        <Progress value={(matches / emojis.length) * 100} className="flex-1 max-w-xs" />
      </div>

      {/* Game Board */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`
                  aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200 
                  flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 hover:scale-105
                  ${card.isFlipped || card.isMatched ? 'bg-white shadow-lg' : 'hover:shadow-md'}
                  ${card.isMatched ? 'opacity-75 border-green-300' : ''}
                `}
                onClick={() => flipCard(card.id)}
              >
                {card.isFlipped || card.isMatched ? card.value : '?'}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryGame;
