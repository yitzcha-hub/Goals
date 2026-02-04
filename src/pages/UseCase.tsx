import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import useCasesBg from '@/assets/images/Usecases-bg.jpg';
import peopleSelfDevImg from '@/assets/images/People-serious-about-self-development.jpg';
import entrepreneursImg from '@/assets/images/Entrepreneurs.jpg';
import studentsImg from '@/assets/images/Students.jpg';
import professionalsImg from '@/assets/images/Professionals.jpg';
import tiredFakeProductivityImg from '@/assets/images/Anyone-tired-of-fake-productivity.jpg';

type UseCaseCard = {
  id: string;
  title: string;
  image: string;
  quote: string;
  name: string;
  role: string;
  otherApps: string[];
  ourApp: string[];
};

const useCaseCards: UseCaseCard[] = [
  {
    id: 'self-development',
    title: 'People serious about self-development',
    image: peopleSelfDevImg,
    quote: 'I tried journals and random goal apps for years. Here I finally have one place for my vision, my plan, and real feedback. I\'m actually becoming who I want to be.',
    name: 'Alex M.',
    role: 'Personal growth coach',
    otherApps: ['Scattered notes and journals with no structure', 'No link between goals and daily actions', 'Zero insight into why I slipped'],
    ourApp: ['Clear goals + written plan in one place', 'Goals tied to time and check-ins', 'AI feedback that helps me improve'],
  },
  {
    id: 'entrepreneurs',
    title: 'Entrepreneurs',
    image: entrepreneursImg,
    quote: 'As a founder I needed to see progress without the noise. Other apps either felt like social media or just to-do lists. This gives me clarity and accountability without the show-off.',
    name: 'Jordan K.',
    role: 'Startup founder',
    otherApps: ['Task apps that don\'t connect to bigger goals', 'Social platforms = comparison and distraction', 'No private accountability with my co-founder'],
    ourApp: ['Goals from 30 days to 5 years, all visible', 'Private accountability—invite who matters', 'Progress and AI insights, no feed'],
  },
  {
    id: 'students',
    title: 'Students',
    image: studentsImg,
    quote: 'I used to forget my long-term goals and just react to deadlines. Now I track what I want to achieve and get reminders. My grades and my mindset both improved.',
    name: 'Sam L.',
    role: 'Graduate student',
    otherApps: ['Planners that only show tasks, not why', 'Habit trackers that guilt-trip when I miss', 'No way to tie goals to real deadlines'],
    ourApp: ['Goals + plan + calendar in one place', 'Check-ins and feedback, not guilt', 'Attach goals to time and get gentle reminders'],
  },
  {
    id: 'professionals',
    title: 'Professionals',
    image: professionalsImg,
    quote: 'I needed something that worked for career growth without turning into another productivity theater. This keeps me honest and moving—no fluff, no gamification.',
    name: 'Riley T.',
    role: 'Product manager',
    otherApps: ['Generic productivity apps with no real analysis', 'Streaks and badges that don\'t improve behavior', 'No link between goals and actual outcomes'],
    ourApp: ['AI that analyzes patterns, not just stores data', 'Meaningful feedback on why and when I slip', 'Goals and development plan that scale with my role'],
  },
  {
    id: 'tired-fake-productivity',
    title: 'Anyone tired of fake productivity',
    image: tiredFakeProductivityImg,
    quote: 'I was done with apps that made me feel busy but not better. This one actually helped me see my progress and get real feedback. Finally, something that delivers.',
    name: 'Morgan P.',
    role: 'Former “productivity junkie”',
    otherApps: ['Endless to-dos with no connection to goals', 'Habit streaks that break and demotivate', 'Lots of data, zero insight'],
    ourApp: ['Goals and a written plan—no fake busywork', 'Check-ins and AI feedback instead of streaks', 'Clear progress and actionable insights'],
  },
];

const UseCase: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToLandingSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    navigate('/');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [navigate]);

  const navItems = [
    { label: 'Features', path: '/features', onClick: () => { setMobileMenuOpen(false); navigate('/features'); } },
    { label: 'Use Cases', path: '/use-case', onClick: () => { setMobileMenuOpen(false); navigate('/use-case'); } },
    { label: 'Pricing', path: '/pricing', onClick: () => { setMobileMenuOpen(false); navigate('/pricing'); } },
    { label: 'About Us', path: '/about', onClick: () => { setMobileMenuOpen(false); navigate('/about'); } },
    { label: 'FAQ', path: '/faq', onClick: () => { setMobileMenuOpen(false); navigate('/faq'); } },
  ];

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <LandingHeader
        navItems={navItems}
        activeSection={null}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero */}
      <section
        id="hero"
        className="relative py-20 sm:py-28 px-4 min-h-[28rem] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${useCasesBg})` }}
          />
        </div>
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--landing-accent)', opacity: 0.85 }} aria-hidden />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--landing-primary) 0%, var(--landing-primary-soft) 50%, #1a6b4f 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.1s',
            }}
          >
            Who This Is For
          </h1>
          <p
            className="text-lg sm:text-xl mb-10 font-bold max-w-2xl mx-auto bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.25s',
            }}
          >
            Goals and Development is built for anyone who wants real progress—not fake productivity. Whether you're building a business, growing as a student, or simply tired of apps that don't deliver, this is for you.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <AuthModal
              trigger={
                <Button size="lg" variant="default" className="hero-cta-primary">
                  Start 7-day free trial
                </Button>
              }
              defaultMode="signup"
            />
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/demo')}
              className="hero-cta-outline"
            >
              Watch demo
            </Button>
          </div>
        </div>
      </section>

      {/* Who This Is For — cards with testimonials & comparison */}
      <section
        id="who-its-for"
        className="py-20 sm:py-24 px-4 overflow-hidden relative"
        style={{ backgroundColor: 'var(--landing-bg)', borderTop: '1px solid var(--landing-border)' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--landing-primary) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4" style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)' }}>Who This Is For</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold max-w-2xl mx-auto" style={{ color: 'var(--landing-text)' }}>
              Real people, real progress—see how they compare
            </h2>
          </div>

          <div className="space-y-16 sm:space-y-20">
            {useCaseCards.map((card, index) => {
              const isEven = index % 2 === 0;
              return (
                <article
                  key={card.id}
                  className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                  {/* Image — alternating side */}
                  <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                    <div className="relative group">
                      <div
                        className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border feature-card-shadow"
                        style={{ borderColor: 'var(--landing-border)' }}
                      >
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                          style={{ background: 'linear-gradient(to top, rgba(44, 157, 115, 0.4) 0%, transparent 55%)' }}
                        />
                      </div>
                      <div
                        className="absolute -bottom-3 left-4 right-4 sm:left-6 sm:right-6 py-2 px-3 rounded-xl text-center text-sm font-semibold"
                        style={{ backgroundColor: 'var(--landing-primary)', color: 'white', boxShadow: '0 6px 20px rgba(44, 157, 115, 0.35)' }}
                      >
                        {card.title}
                      </div>
                    </div>
                  </div>

                  {/* Content: quote + comparison */}
                  <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                    <div className="relative pl-6 sm:pl-8">
                      <Quote className="absolute left-0 top-0 h-8 w-8 opacity-30" style={{ color: 'var(--landing-primary)' }} />
                      <blockquote className="text-base sm:text-lg font-medium mb-6 leading-relaxed" style={{ color: 'var(--landing-text)' }}>
                        "{card.quote}"
                      </blockquote>
                      <footer className="mb-8">
                        <span className="font-bold" style={{ color: 'var(--landing-primary)' }}>{card.name}</span>
                        <span className="opacity-80" style={{ color: 'var(--landing-text)' }}> · {card.role}</span>
                      </footer>

                      {/* Other apps vs Us */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div
                          className="rounded-xl p-4 border"
                          style={{ backgroundColor: 'rgba(220, 53, 69, 0.04)', borderColor: 'rgba(220, 53, 69, 0.2)' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <X className="h-4 w-4 text-red-500 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--landing-text)' }}>Other apps</span>
                          </div>
                          <ul className="space-y-1.5 text-sm" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
                            {card.otherApps.map((item, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-red-400/80 mt-0.5">·</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div
                          className="rounded-xl p-4 border feature-card-shadow"
                          style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'rgba(44, 157, 115, 0.3)' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Check className="h-4 w-4 shrink-0 text-white rounded-full" style={{ backgroundColor: 'var(--landing-primary)', padding: 2 }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--landing-primary)' }}>Goals & Development</span>
                          </div>
                          <ul className="space-y-1.5 text-sm" style={{ color: 'var(--landing-text)' }}>
                            {card.ourApp.map((item, i) => (
                              <li key={i} className="flex gap-2">
                                <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: 'var(--landing-primary)' }} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter navigate={navigate} scrollToLandingSection={scrollToLandingSection} />
    </div>
  );
};

export default UseCase;
