import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Users, Sun, TrendingUp, Award, Target, BookOpen, Star, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540994086_6a18ed5c.webp",
    bio: "Former product lead at Google. Passionate about helping people achieve their dreams without the pressure of social comparison."
  },
  {
    name: "Michael Rodriguez",
    role: "CTO & Co-Founder",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540996230_c51f9393.webp",
    bio: "15 years building scalable systems. Believes everyone deserves tools that celebrate their unique journey."
  },
  {
    name: "Emma Thompson",
    role: "Head of Product Design",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540998522_596ca11c.webp",
    bio: "Award-winning designer focused on creating experiences that make users feel good about themselves."
  },
  {
    name: "David Park",
    role: "Marketing Director",
    image: "https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759541000172_098df5df.webp",
    bio: "Growth expert dedicated to spreading the message that your only competition is who you were yesterday."
  }
];

const values = [
  { icon: Heart, title: "Self-Compassion", description: "We believe in celebrating your wins, not comparing yourself to others. Your journey is uniquely yours." },
  { icon: Sun, title: "Positivity", description: "Every feature is designed to make you feel good about your progress, not inadequate like social media." },
  { icon: Target, title: "Focus", description: "Clear goal timelines from 30 days to 5 years help you stay on track without overwhelm." },
  { icon: Leaf, title: "Growth", description: "We believe in the power of intentional goal-setting and personal development to create your best life." }
];

const milestones = [
  { year: "2023", title: "The Vision", description: "Founded after realizing social media was making people feel worse, not better, about their lives" },
  { year: "Early 2024", title: "Beta Launch", description: "Released to 100 beta testers who shared our vision of personal growth without comparison" },
  { year: "Mid 2024", title: "Gratitude Feature", description: "Launched gratitude journaling, helping users focus on what they have, not what they lack" },
  { year: "Late 2024", title: "10K Users", description: "Reached 10,000 active users achieving their goals across 50 countries" },
  { year: "2025", title: "5-Year Vision", description: "Introduced long-term goal planning to help users dream bigger than ever before" }
];

const testimonials = [
  { name: "Jessica M.", role: "Entrepreneur", quote: "Finally an app that celebrates MY wins without showing me everyone else's highlight reel. I feel motivated, not inadequate." },
  { name: "Robert K.", role: "Teacher", quote: "The 0-10 scale is brilliant. I can see exactly where I am on each goal without the pressure of percentages." },
  { name: "Priya S.", role: "Healthcare Worker", quote: "The gratitude journal changed my mindset. I wake up excited to document my journey, not compare it to others." }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-lime-50 to-emerald-100">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68dab31588d806ca5c085b8d_1759540992424_2edec073.webp" 
          alt="Goals and Development Team" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-emerald-800/70 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Leaf className="h-10 w-10 text-lime-300" />
            </div>
            <h1 className="text-5xl font-bold mb-4">About Goals and Development</h1>
            <p className="text-xl max-w-2xl mx-auto text-green-100">Empowering you to achieve your goals without comparing yourself to others</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 border-0 shadow-lg bg-white border-l-4 border-l-green-500">
            <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To create a space where you can dream, plan, and achieve without the toxic comparison culture of social media. 
              We believe your only competition is who you were yesterday, and every step forward deserves celebration.
            </p>
          </Card>
          <Card className="p-8 border-0 shadow-lg bg-white border-l-4 border-l-orange-500">
            <Award className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              A world where everyone has a personal sanctuary for growth—a place to visualize their dreams, 
              track their progress, and celebrate their unique journey without feeling inadequate compared to others.
            </p>
          </Card>
        </div>

        {/* Why We're Different */}
        <div className="mb-16 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Why We're Different</h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p className="mb-4 text-lg">
              <strong className="text-orange-600">Social media is broken.</strong> Everyone posts their highlight reels, 
              making you feel like you're falling behind. Studies show that comparing yourself to others on social platforms 
              leads to anxiety, depression, and feeling like a failure.
            </p>
            <p className="mb-4 text-lg">
              <strong className="text-green-600">Goals and Development is different.</strong> This is YOUR space. 
              There are no feeds showing what others are achieving. No likes or followers. No pressure to perform for an audience.
            </p>
            <p className="text-lg">
              <strong className="text-green-600">Just you, your dreams, and a clear path forward.</strong> 
              Whether it's a 30-day goal or a 5-year vision, we help you track progress on YOUR terms, 
              celebrate YOUR wins, and create the life YOU desire.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Our Story</h2>
          <div className="prose prose-lg max-w-4xl mx-auto text-gray-600">
            <p className="mb-4">
              Goals and Development was born from a simple realization: the apps meant to help us improve our lives 
              were actually making us feel worse. Our founders, Sarah and Michael, noticed that every "productivity" 
              and "goal-tracking" app eventually led to comparison, competition, and feeling inadequate.
            </p>
            <p>
              They asked: "What if we created something focused entirely on YOU? No social features. No leaderboards. 
              Just a beautiful, private space to dream big, track your progress, and celebrate every step forward." 
              That question became Goals and Development—and it's changing how people approach their goals.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 items-start">
                <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-600 to-lime-500 text-white">{milestone.year}</Badge>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow border-0 shadow-md bg-white">
                <value.icon className={`w-12 h-12 mx-auto mb-4 ${index % 2 === 0 ? 'text-green-600' : 'text-orange-500'}`} />
                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-lg bg-white">
                <img src={member.image} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-800">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-0 shadow-lg bg-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Summary */}
        <div className="mb-16 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-lime-50 border-t-4 border-t-green-500">
            <Target className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Goal Timelines</h3>
            <p className="text-gray-600 text-sm">30, 60, 90 days to 5-year plans with 0-10 progress tracking</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 border-t-4 border-t-orange-500">
            <Heart className="w-10 h-10 text-orange-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Gratitude Journal</h3>
            <p className="text-gray-600 text-sm">Focus on what you have, not what you lack</p>
          </Card>
          <Card className="p-6 text-center border-0 shadow-lg bg-gradient-to-br from-lime-50 to-emerald-50 border-t-4 border-t-lime-500">
            <BookOpen className="w-10 h-10 text-lime-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-2 text-gray-800">Life Journal</h3>
            <p className="text-gray-600 text-sm">A life worth living is worth recording</p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-500/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-lime-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Growth Journey?</h2>
            <p className="text-xl mb-6 text-green-100">Start your 7 day free trial today. No credit card required.</p>

            <Button 
              size="lg" 
              onClick={() => navigate('/')}
              className="text-lg px-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg"
            >
              <Flame className="h-5 w-5 mr-2" />
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-950 text-white py-8 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-lg text-green-100">Goals and Development</span>
          </div>
          <p className="text-green-400">&copy; {new Date().getFullYear()} Goals and Development. Your journey, your way with <span className="text-orange-400">passion</span>.</p>
        </div>
      </footer>
    </div>
  );
}
