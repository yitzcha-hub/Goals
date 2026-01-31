import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import { NewsletterSignup } from './NewsletterSignup';
import { ProductTour } from './ProductTour';
import { OfflineIndicator } from './OfflineIndicator';
import ManifestationDashboard from './ManifestationDashboard';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { LogIn, User, Leaf, Heart, Target, Calendar, Star, Check, Camera, BookOpen, Award, TrendingUp, Sun, Moon, Compass, Zap, Flame } from 'lucide-react';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const [isTourActive, setIsTourActive] = useState(false);
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  const heroSlides = [
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759369590933_f4250ffb.webp',
      title: 'Ready to Change Course?',
      subtitle: 'Chart a new direction, navigate your journey with confidence, and reach the shores of your aspirations'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760533818931_242e080d.webp',
      title: 'Take a Different Path',
      subtitle: 'Every journey begins with a single step. Start climbing toward your dreams today'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760533972699_07a498da.webp',
      title: 'Build Deeper Connections',
      subtitle: 'Strengthen relationships, create meaningful bonds, and discover the power of authentic connection'
    },
    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759516904849_23425d6f.webp',
      title: 'Lock In, Start Today, Greater Tomorrows',
      subtitle: 'Embrace adventure, pursue your passions, and create unforgettable memories along the way'
    },


    {
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1760535111149_1ed7b966.webp',
      title: 'Dreams Start Here',
      subtitle: 'Life doesn\'t wait, neither should You'
    }
  ];




  const features = [
    {
      icon: Calendar,
      title: '30, 60, 90 Day Goals',
      description: 'Set short-term goals with clear timelines to build momentum and see progress quickly.',
      color: 'bg-green-500'
    },
    {
      icon: Target,
      title: '1 Year Goals',
      description: 'Plan your medium-term future with meaningful milestones that shape your life.',
      color: 'bg-orange-500'

    },
    {
      icon: Compass,
      title: '5 Year Vision',
      description: 'Create your long-term vision and watch as your dreams become reality step by step.',
      color: 'bg-emerald-500'
    },
    {
      icon: TrendingUp,
      title: '0-10 Progress Scale',
      description: 'Track exactly where you are on each goal with our intuitive progress slider.',
      color: 'bg-amber-500'
    },
    {
      icon: Camera,
      title: 'Vision Board Photos',
      description: 'Upload images of your dreams and goals to visualize your success every day.',
      color: 'bg-lime-600'
    },
    {
      icon: Zap,
      title: 'Smart Recommendations',
      description: 'Get AI-powered suggestions on what to focus on next to achieve your goals faster.',
      color: 'bg-orange-600'
    },
    {
      icon: Check,
      title: 'To-Do List',
      description: 'Separate task list for daily items that need done - earn rewards for completing them!',
      color: 'bg-teal-500'
    },
    {
      icon: Award,
      title: 'Rewards System',
      description: 'Earn points and achievements for every goal you progress on and task you complete.',
      color: 'bg-amber-400'
    },
    {
      icon: Heart,
      title: 'Gratitude Journal',
      description: 'Record what you\'re thankful for and watch your positivity grow over time.',
      color: 'bg-orange-400'
    },
    {
      icon: BookOpen,
      title: 'Life Journal',
      description: 'Document your journey with entries and photos - a life worth living is worth recording.',
      color: 'bg-emerald-400'
    },
    {
      icon: Flame,
      title: 'Focus on YOU',
      description: 'No social comparison, no feeds of others - this is YOUR space to grow and thrive.',
      color: 'bg-orange-500'
    },
    {
      icon: Leaf,
      title: 'Feel Good Design',
      description: 'Built to make you feel accomplished and motivated, not inadequate like social media.',
      color: 'bg-green-500'
    }
  ];


  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Entrepreneur',
      quote: 'This app changed my life. I finally feel in control of my future and celebrate my own wins without comparing to others.',
      avatar: 'S'
    },
    {
      name: 'James K.',
      role: 'Teacher',
      quote: 'The 0-10 scale makes it so easy to see my progress. I\'ve achieved more in 3 months than I did all last year!',
      avatar: 'J'
    },
    {
      name: 'Maria L.',
      role: 'Healthcare Worker',
      quote: 'The gratitude journal has transformed my mindset. I wake up excited to document my journey every day.',
      avatar: 'M'
    },
    {
      name: 'David R.',
      role: 'Software Developer',
      quote: 'Finally an app that\'s about MY goals, not showing off to others. The 5-year vision feature is incredible.',
      avatar: 'D'
    }
  ];

  useEffect(() => {
    if (!api) return;
    
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
    
    const interval = setInterval(() => {
      if (api) {
        api.scrollNext();
      }
    }, 7000);


    return () => clearInterval(interval);
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100">
        <div className="text-center">
          <Leaf className="h-16 w-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-green-800 font-medium">Loading your growth journey...</p>
        </div>
      </div>
    );
  }

  // Show personalized dashboard for authenticated users
  if (user) {
    return <ManifestationDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm py-4 px-4 sticky top-0 z-50 border-b border-green-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-400 rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
              Goals and Development
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/demo')} 
              variant="ghost" 
              className="text-green-700 hover:text-orange-600 hover:bg-orange-50"
            >
              See Demo
            </Button>
            
            <Button 
              onClick={() => navigate('/about')} 
              variant="ghost" 
              className="text-green-700 hover:text-orange-600 hover:bg-orange-50"
            >
              About
            </Button>

            <AuthModal 
              trigger={
                <Button className="bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              } 
            />
          </div>
        </div>
      </div>

      {/* Hero Section with Carousel */}
      {heroSlides && heroSlides.length > 0 && (
        <Carousel 
          setApi={setApi} 
          className="w-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <section 
                  className="relative h-[500px] flex items-center justify-center text-center px-4" 
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url('${slide.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >

                  <div className="max-w-4xl mx-auto text-white">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg text-white">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-xl mb-8 text-white/90 drop-shadow-md font-medium max-w-2xl mx-auto">
                      {slide.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <AuthModal 
                        trigger={
                          <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-lg text-base font-semibold px-8">
                            <Flame className="h-5 w-5 mr-2" />
                            Start Your 7 Day Free Trial
                          </Button>
                        }
                        defaultMode="signup"
                      />


                      <Button 
                        size="lg" 
                        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-800 text-base font-semibold px-8"
                        onClick={() => navigate('/demo')}
                      >
                        See Demo
                      </Button>
                    </div>
                  </div>

                </section>

              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      )}

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-300">
            Your Personal Growth Sanctuary
          </Badge>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            This Is About <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">YOU</span>, Not Others
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Unlike social media where everyone shows their highlight reel, Goals and Development is your private space 
            to dream, plan, and achieve. No comparisons. No judgment. Just your journey to becoming your best self.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Feel Good</h3>
              <p className="text-gray-600">Designed to celebrate YOUR wins and make you feel accomplished every day.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Stay Focused</h3>
              <p className="text-gray-600">Clear goal timelines from 30 days to 5 years keep you on track.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Grow Naturally</h3>
              <p className="text-gray-600">Upload vision photos and watch your dreams become reality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
              <Zap className="h-3 w-3 mr-1 inline" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need to Achieve Your Goals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you set, track, and achieve your goals at every timeline
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-white group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>




      {/* Pricing Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800 border-green-300">
              7 Day FREE Trial
            </Badge>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">
              Start with a 7 day free trial, then choose the plan that works for you
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <Card className="border-2 border-gray-200 hover:border-green-300 transition-all">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Monthly</CardTitle>
                <CardDescription>Pay as you go</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-800">$4.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {['All goal timelines (30 days - 5 years)', '0-10 progress tracking', 'Vision board photos', 'To-do list with rewards', 'Gratitude journal', 'Life journal with photos'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <AuthModal 
                  trigger={
                    <Button className="w-full" variant="outline">
                      Start 7 Day Free Trial
                    </Button>

                  }
                  defaultMode="signup"
                />
              </CardContent>
            </Card>

            {/* Annual - Most Popular */}
            <Card className="border-2 border-orange-500 shadow-xl relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-400 text-white border-0">
                <Flame className="h-3 w-3 mr-1 inline" />
                Best Value
              </Badge>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Annual</CardTitle>
                <CardDescription>Save $20 per year</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">$39.99</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <p className="text-sm text-orange-600 font-medium mt-1">Just $3.33/month!</p>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {['Everything in Monthly', 'Priority support', 'Advanced analytics', 'Goal templates library', 'Data export', 'Early access features'].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <AuthModal 
                  trigger={
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white">
                      <Flame className="h-4 w-4 mr-2" />
                      Start 7 Day Free Trial
                    </Button>

                  }
                  defaultMode="signup"
                />
              </CardContent>
            </Card>
          </div>


          <p className="text-center text-sm text-gray-500 mt-8">
            All plans include a 7 day free trial. Cancel anytime. No credit card required to start.
          </p>

        </div>
      </section>






      {/* Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Join thousands who are achieving their goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Growth Journey?</h2>
          <p className="text-xl mb-8 text-white/90">
            Start your 7 day free trial today. No credit card required. Your future self will thank you.
          </p>



          <AuthModal 
            trigger={
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-lg text-lg font-semibold px-10 py-6">
                <Flame className="h-5 w-5 mr-2" />
                Begin Your Journey Now
              </Button>
            }
            defaultMode="signup"
          />
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* Footer */}
      <footer className="bg-green-950 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-lime-400 rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">Goals and Development</span>
              </div>
              <p className="text-green-300 text-sm">
                Your personal sanctuary for growth, achievement, and becoming your best self.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Features</h4>
              <ul className="space-y-2 text-green-300 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Goal Tracking</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Vision Board</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Gratitude Journal</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Life Journal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Company</h4>
              <ul className="space-y-2 text-green-300 text-sm">
                <li><a href="/about" className="hover:text-orange-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-orange-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-orange-400">Support</h4>
              <ul className="space-y-2 text-green-300 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-800 pt-8 text-center text-green-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Goals and Development. All rights reserved. Made with <span className="text-orange-400">passion</span> for achievers everywhere.</p>
          </div>
        </div>
      </footer>
      
      {/* Product Tour */}
      <ProductTour isActive={isTourActive} onComplete={() => setIsTourActive(false)} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default AppLayout;
