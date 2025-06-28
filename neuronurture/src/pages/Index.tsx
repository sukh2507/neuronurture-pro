
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, } from '@/components/ui/card';
import { Heart, Baby, Brain, Users, Shield, Calendar, MessageSquare, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Header onGetStarted={handleGetStarted} isAuthenticated={isAuthenticated} />
      
      <Hero onGetStarted={handleGetStarted} />
      
      <Features />
      
      <Testimonials />
      
      <Footer />
    </div>
  );
};

export default Index;
