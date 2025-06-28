
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Baby, Brain, Star } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-pink-600">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm font-medium">Trusted by 10,000+ Mothers</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Nurturing
                </span>
                <br />
                <span className="text-gray-800">Every Step of</span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Motherhood
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered platform supporting maternal mental health and early childhood development. 
                From pregnancy to your child's growth milestones, we're here for every beautiful moment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Heart className="h-5 w-5 mr-2" />
                Start Your Journey
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-pink-200 text-pink-600 hover:bg-pink-50 text-lg px-8 py-4 rounded-full"
              >
                <Baby className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">10K+</div>
                <div className="text-sm text-gray-600">Happy Mothers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">50K+</div>
                <div className="text-sm text-gray-600">Children Assessed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">99%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bottom-20 z-10">
              <img 
                src="https://images.unsplash.com/photo-1750327234802-d8deb0e7351b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D" 
                alt="Mother and child"
                className="rounded-3xl shadow-2xl w-[90%]"
              />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-24 z-20 right-4 bg-white p-4 rounded-2xl shadow-lg animate-bounce">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            
             <div className="absolute z-20 bottom-14 -left-4 bg-white p-4 rounded-2xl shadow-lg animate-bounce"> {/* animate-pulse delay-1000 */}
              <Brain  className="h-8 w-8 text-purple-500" />
            </div>
            
            <div className="absolute bottom-14 z-20 right-6 bg-white p-3 rounded-2xl shadow-lg animate-bounce">
              <Baby className="h-9 w-9 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
