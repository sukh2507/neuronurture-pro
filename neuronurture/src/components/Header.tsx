
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onGetStarted: () => void;
  isAuthenticated: boolean;
}

const Header = ({ onGetStarted, isAuthenticated }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate=useNavigate()
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span onClick={() => navigate('/')} className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              NeuroNurture
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-pink-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-700 hover:text-pink-600 transition-colors">About</a>
            <a href="#testimonials" className="text-gray-700 hover:text-pink-600 transition-colors">Stories</a>
            <a href="#contact" className="text-gray-700 hover:text-pink-600 transition-colors">Contact</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onGetStarted}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </Button>
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-pink-100">
            <div className="flex flex-col gap-4 pt-4">
              <a href="#features" className="text-gray-700 hover:text-pink-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-700 hover:text-pink-600 transition-colors">About</a>
              <a href="#testimonials" className="text-gray-700 hover:text-pink-600 transition-colors">Stories</a>
              <a href="#contact" className="text-gray-700 hover:text-pink-600 transition-colors">Contact</a>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={onGetStarted}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                >
                  {isAuthenticated ? 'Dashboard' : 'Sign In'}
                </Button>
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
