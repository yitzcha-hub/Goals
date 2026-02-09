import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Target, Calendar, Check, BookOpen, Sparkles, Users, BarChart3, Smartphone, AppWindow, UserX, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { HeroFloatingCircles } from '@/components/HeroFloatingCircles';
import heroBg1 from '@/assets/images/happy-boss-drawing-graph-training-colleagues_1262-1840.jpg';
import heroBg2 from '@/assets/images/happy-group-creative-young-business-people_252847-6131.jpg';
import stepImg1 from '@/assets/images/Choose-who-you-want-to-become.jpg';
import stepImg2 from '@/assets/images/Write-your-goals-and-development-plan.jpg';
import stepImg3 from '@/assets/images/Attach-goals-to-time.jpg';
import stepImg4 from '@/assets/images/Get-AI-feedback-on-your-progress.jpg';

const heroTaglines = [
  'Learn from the goal-setting and development of successful people, and get AI guidance to evaluate and improve your own path - Success',
  'A private personal growth system that helps you set goals, create a written plan, stay accountable, and measure your progress over time.',
];

export const LandingContent: React.FC = () => {
  const navigate = useNavigate();
  const [heroTaglineIndex, setHeroTaglineIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroTaglineIndex((i) => (i + 1) % 2);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* 1. Hero — The Big Idea */}
      <section
        id="hero"
        className="relative py-20 sm:py-28 px-4 min-h-[28rem] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url(${heroBg1})`,
              opacity: heroTaglineIndex === 0 ? 1 : 0,
            }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
            style={{
              backgroundImage: `url(${heroBg2})`,
              opacity: heroTaglineIndex === 1 ? 1 : 0,
            }}
          />
        </div>
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--landing-accent)', opacity: 0.85 }} aria-hidden />
        <HeroFloatingCircles />
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
            Become the person you want to be.
          </h1>
          <p
            className="text-lg sm:text-xl mb-10 font-bold max-w-2xl mx-auto bg-clip-text text-transparent animate-slide-up transition-opacity duration-500"
            style={{
              backgroundImage: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.25s',
            }}
            key={heroTaglineIndex}
          >
            {heroTaglines[heroTaglineIndex]}
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

      {/* 2. The Problem → Solution */}
      <section id="problem" className="py-24 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--landing-bg)', borderTop: '1px solid var(--landing-border)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, var(--landing-primary) 0%, transparent 70%)' }} aria-hidden />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, var(--landing-primary) 0%, transparent 70%)' }} aria-hidden />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--landing-text) 1px, transparent 0)', backgroundSize: '40px 40px' }} aria-hidden />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5 animate-slide-up" style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)', animationDelay: '0.1s' }}>
              <Zap className="h-3.5 w-3.5" />
              Why we built this
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 animate-slide-up tracking-tight" style={{ color: 'var(--landing-text)', animationDelay: '0.15s' }}>
              Problems we solve
            </h2>
            <p className="text-lg max-w-2xl mx-auto opacity-90 leading-relaxed animate-slide-up" style={{ color: 'var(--landing-text)', animationDelay: '0.2s' }}>
              You&apos;ve tried apps and hacks. What&apos;s missing isn&apos;t motivation—it&apos;s a system that actually fits how you want to grow.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Smartphone, problem: 'Social media comparison', problemDesc: 'Your feed becomes a highlight reel of everyone else. You compare your behind-the-scenes to their best moments—and it drains you.', solution: 'Private space, no feed. Your journey stays yours—no highlight reels, no comparison. A personal development space that focuses only on you.' },
              { icon: AppWindow, problem: "Apps that don't change your life", problemDesc: "Another to-do app, another habit tracker. They organize tasks but don't help you become someone new. You need a development system, not another inbox.", solution: 'Full development system: goals + written plan + calendar + AI feedback. Not tasks—transformation. One place to become who you want to be.' },
              { icon: Target, problem: 'Goals you set and forget', problemDesc: 'New Year resolutions. Big ideas in a notes app. Without a written plan and a place to revisit them, goals fade by February.', solution: "Written plan + calendar + revisit. Write your development plan, attach goals to time with reminders, and revisit them in one place so they don't fade." },
              { icon: UserX, problem: 'No real accountability', problemDesc: 'Going it alone is hard. You need someone in your corner—without broadcasting to the world.', solution: 'Family connection. Private accountability partners. Invite trusted people—no broadcasting, no social feed. Real support without the noise.' },
              { icon: TrendingUp, problem: "No way to measure growth", problemDesc: "You feel like you're improving, but where's the proof? Without tracking progress over time, it's hard to see how far you've come.", solution: "Progress tracking + AI insights. Track your progress over time. Get AI feedback on patterns, when you slip, and how to improve. See how far you've actually come." },
            ].map(({ icon: Icon, problem, problemDesc, solution }, i) => (
              <article
                key={i}
                className="group relative flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl border transition-all duration-500 hover:shadow-xl animate-slide-up"
                style={{
                  borderColor: 'var(--landing-border)',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  animationDelay: `${0.25 + i * 0.07}s`,
                }}
              >
                <div className="flex-1 p-6 sm:p-8 lg:border-r" style={{ borderColor: 'var(--landing-border)' }}>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center opacity-90" style={{ backgroundColor: 'rgba(120,120,120,0.12)' }}>
                      <Icon className="h-6 w-6" style={{ color: 'var(--landing-text)' }} strokeWidth={2} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 block" style={{ color: 'var(--landing-text)' }}>Problem</span>
                      <h3 className="font-bold text-base sm:text-lg mb-2" style={{ color: 'var(--landing-text)' }}>{problem}</h3>
                      <p className="text-sm leading-relaxed opacity-85" style={{ color: 'var(--landing-text)' }}>{problemDesc}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center shrink-0 w-16" style={{ backgroundColor: 'var(--landing-accent)' }}>
                  <ArrowRight className="h-6 w-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'var(--landing-primary)' }} strokeWidth={2.5} />
                </div>
                <div className="lg:hidden flex items-center justify-center py-2 px-4" style={{ backgroundColor: 'var(--landing-accent)' }}>
                  <ArrowRight className="h-5 w-5 rotate-90" style={{ color: 'var(--landing-primary)' }} strokeWidth={2.5} />
                </div>
                <div className="flex-1 p-6 sm:p-8 relative overflow-hidden" style={{ backgroundColor: 'var(--landing-accent)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, var(--landing-primary) 0%, transparent 70%)' }} aria-hidden />
                  <div className="relative flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: 'var(--landing-primary)' }}>
                      <Check className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1 block" style={{ color: 'var(--landing-primary)' }}>Our solution</span>
                      <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'var(--landing-text)' }}>{solution}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center mt-12 text-sm font-medium opacity-85 max-w-xl mx-auto animate-slide-up" style={{ color: 'var(--landing-text)', animationDelay: '0.75s' }}>
            A private space for your goals, your plan, your progress—and real accountability—without the noise.
          </p>
        </div>
      </section>

      {/* 3. The Vision */}
      <section
        id="vision"
        className="relative py-24 px-4 overflow-hidden"
        style={{ backgroundColor: 'var(--landing-accent)' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--landing-primary) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(var(--landing-text) 1px, transparent 1px), linear-gradient(90deg, var(--landing-text) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
          aria-hidden
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 animate-vision-scale"
            style={{
              backgroundColor: 'var(--landing-primary)',
              color: 'white',
              animationDelay: '0.1s',
              animationFillMode: 'forwards',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            The Vision
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 leading-tight animate-vision-reveal"
            style={{
              color: 'var(--landing-text)',
              animationDelay: '0.2s',
              animationFillMode: 'forwards',
            }}
          >
            This is not a goal tracker.
          </h2>
          <p
            className="text-xl sm:text-2xl font-semibold mb-6 animate-vision-reveal"
            style={{
              color: 'var(--landing-primary)',
              animationDelay: '0.35s',
              animationFillMode: 'forwards',
            }}
          >
            This is your private development space.
          </p>
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed animate-vision-reveal"
            style={{
              color: 'var(--landing-text)',
              animationDelay: '0.5s',
              animationFillMode: 'forwards',
            }}
          >
            A place where you choose who you want to become, write your plan, measure your progress, and stay accountable—without comparison or noise.
          </p>
          <div
            className="mt-10 mx-auto h-1 w-16 rounded-full animate-vision-scale opacity-0"
            style={{
              backgroundColor: 'var(--landing-primary)',
              animationDelay: '0.7s',
              animationFillMode: 'forwards',
            }}
          />
        </div>
      </section>

      {/* 4. How The System Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white overflow-hidden" style={{ borderTop: '1px solid var(--landing-border)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center" style={{ color: 'var(--landing-text)' }}>How The System Works</h2>
          <p className="text-center text-sm sm:text-base opacity-80 mb-12 max-w-2xl mx-auto" style={{ color: 'var(--landing-text)' }}>
            Four simple steps to define your path, plan it, schedule it, and improve with AI.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: 1, title: 'Choose who you want to become', icon: Target, img: stepImg1 },
              { step: 2, title: 'Write your goals and development plan', icon: BookOpen, img: stepImg2 },
              { step: 3, title: 'Attach goals to time (calendar + reminders)', icon: Calendar, img: stepImg3 },
              { step: 4, title: 'Get AI feedback on your progress', icon: Sparkles, img: stepImg4 },
            ].map(({ step, title, icon: Icon, img }) => (
              <article
                key={step}
                className="group rounded-2xl overflow-hidden border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ borderColor: 'var(--landing-border)' }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={img}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute top-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: 'var(--landing-primary)' }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"
                    aria-hidden
                  />
                  <span
                    className="absolute bottom-3 left-3 text-white text-xs font-semibold tracking-wide uppercase"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    Step {step}
                  </span>
                </div>
                <div className="p-4 sm:p-5 text-center">
                  <p className="font-semibold text-sm sm:text-base leading-snug" style={{ color: 'var(--landing-text)' }}>
                    {title}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section id="cta" className="py-20 px-4 text-white" style={{ backgroundColor: 'var(--landing-primary)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start becoming who you want to be.</h2>
          <AuthModal trigger={<Button size="lg" variant="secondary" className="bg-white hover:bg-white/90" style={{ color: 'var(--landing-primary)' }}>Start 7-day free trial</Button>} defaultMode="signup" />
        </div>
      </section>
    </>
  );
};
