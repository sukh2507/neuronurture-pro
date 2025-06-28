import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Bot, User, Loader2 } from 'lucide-react';
const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface Message {
  message: string;
  timestamp: string;
  sender: 'mother' | 'ai';
}

interface NeuroAIChatProps {
  motherProfile?: any;
}

const NeuroAIChat: React.FC<NeuroAIChatProps> = ({ motherProfile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing messages when component mounts
  useEffect(() => {
    loadChatHistory();
  }, [motherProfile]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = () => {
    if (motherProfile?.messages) {
      const combinedMessages: Message[] = [];
      
      // Combine mother and AI messages and sort by timestamp
      const motherMessages = motherProfile.messages.mother || [];
      const aiMessages = motherProfile.messages.ai || [];
      
      // Assuming messages are paired (mother[0] with ai[0], mother[1] with ai[1], etc.)
      const maxLength = Math.max(motherMessages.length, aiMessages.length);
      
      for (let i = 0; i < maxLength; i++) {
        if (motherMessages[i]) {
          combinedMessages.push({
            message: motherMessages[i].message,
            timestamp: motherMessages[i].timestamp,
            sender: 'mother'
          });
        }
        if (aiMessages[i]) {
          combinedMessages.push({
            message: aiMessages[i].message,
            timestamp: aiMessages[i].timestamp,
            sender: 'ai'
          });
        }
      }
      
      setMessages(combinedMessages);
    }
    setIsInitialLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    // Add user message to local state immediately
    const userMsg: Message = {
      message: userMessage,
      timestamp: new Date().toISOString(),
      sender: 'mother'
    };
    
    setMessages(prev => [...prev, userMsg]);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/neuroai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response to local state
        const aiMsg: Message = {
          message: data.aiResponse,
          timestamp: new Date().toISOString(),
          sender: 'ai'
        };
        
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMsg: Message = {
        message: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col min-h-0 w-full">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Ask NeuroAI
            <span className="text-sm font-normal opacity-90 ml-auto">
              Your AI mental health companion
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-pink-50/30 to-purple-50/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain className="h-16 w-16 text-pink-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome to NeuroAI Chat
                </h3>
                <p className="text-gray-500 max-w-md">
                  I'm here to support you with mental health guidance, parenting tips, and emotional wellness. 
                  Ask me anything about maternal mental health, child development, or how you're feeling today.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'mother' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'mother'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none'
                        : 'bg-white shadow-md border border-pink-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        msg.sender === 'mother'
                          ? 'text-pink-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                  
                  {msg.sender === 'mother' && (
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-full flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-white shadow-md border border-pink-100 p-3 rounded-lg rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                    <span className="text-sm text-gray-600">NeuroAI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-pink-100 p-4 bg-white">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask NeuroAI about mental health, parenting, or how you're feeling..."
                disabled={isLoading}
                className="flex-1 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • NeuroAI provides supportive guidance, not medical advice
            </p>
          </div>
        </CardContent>
      </Card>
  );
};

export default NeuroAIChat;