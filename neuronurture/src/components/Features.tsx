
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users, Shield, Calendar, MessageSquare, GamepadIcon, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Heart,
      title: "Mental Health Tracking",
      description: "Daily mood check-ins with AI-powered insights to support your emotional wellbeing throughout pregnancy and beyond.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Brain,
      title: "Child Development Games",
      description: "Interactive screening games that assess cognitive development, learning disabilities, and autism spectrum indicators.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with other mothers, share experiences, and get support from verified healthcare professionals.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Expert Consultations",
      description: "Direct access to pediatric specialists and mental health professionals for personalized guidance.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Calendar,
      title: "Smart Reminders",
      description: "Personalized timeline with pregnancy milestones, child development checkpoints, and health reminders.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Secure messaging with healthcare providers and instant support when you need it most.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: GamepadIcon,
      title: "Fun Learning Games",
      description: "Engaging activities that help identify learning differences early while keeping children entertained.",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed reports and insights tracking your mental health journey and your child's development milestones.",
      color: "from-red-500 to-pink-500"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-gray-800">For Your Journey</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools and support designed specifically for mothers and their children's developmental needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
