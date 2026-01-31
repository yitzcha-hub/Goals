import React, { useState } from 'react';
import { FamilyDashboard } from './FamilyDashboard';
import { FamilyChat } from './FamilyChat';
import { Button } from './ui/button';
import { Users, Trophy, Target, MessageCircle } from 'lucide-react';


const FamilyLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 text-center">
        <p className="font-semibold">❤️ FAMILY PLAN - Achieve Goals Together</p>
      </div>

      <section className="relative h-[60vh] flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3)), url('https://d64gsuwffb70l.cloudfront.net/68c468b90879cba7ca0dcccd_1757703340244_c4563a20.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
        <div className="max-w-4xl mx-auto text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12" />
            <Trophy className="w-12 h-12" />
            <Target className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Family Goals & Challenges
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Work together, celebrate together, grow together
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              View Dashboard
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20">
              Invite Family
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <FamilyDashboard />
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-3xl font-bold mb-2">Stay Connected</h2>
            <p className="text-muted-foreground">Chat with your family, share updates, and encourage each other</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <FamilyChat />
          </div>
        </div>
      </section>


      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Family Journey?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of families achieving their goals together</p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FamilyLayout;
