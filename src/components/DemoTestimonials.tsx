import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const DemoTestimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759372135118_4c9c2359.webp',
      text: 'DEPO helped me launch my business in 6 months. The visual progress tracking kept me motivated every single day!',

      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Fitness Enthusiast',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759372137380_e7047228.webp',
      text: 'Lost 30 pounds and ran my first marathon. This app made tracking my fitness goals fun and engaging.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Home Builder',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759372139359_be9a5c69.webp',
      text: 'Built my dream home from scratch. The milestone tracking and progress photos kept our family excited throughout the journey.',
      rating: 5
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Career Changer',
      image: 'https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759372142163_71220ea3.webp',
      text: 'Transitioned to my dream career in tech. The DEPO framework gave me the structure I needed to succeed.',

      rating: 5
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Success Stories</h2>
          <p className="text-lg text-gray-600">Join thousands who've achieved their goals with DEPO</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {testimonials.map(testimonial => (
            <Card key={testimonial.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-emerald-100"
                  />
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DemoTestimonials;
