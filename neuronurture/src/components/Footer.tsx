
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">NeuroNurture</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Supporting mothers and children with AI-powered tools for mental health and developmental screening.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-pink-400 transition-colors">Mental Health</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Child Screening</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Consultations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-pink-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-pink-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@neuronurture.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Healthcare District, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 NeuroNurture. Made with ❤️ for mothers and children everywhere.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
