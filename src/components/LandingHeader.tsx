import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthModal } from '@/components/auth/AuthModal';

export type NavItem =
  | { label: string; path: string; onClick: () => void }
  | { label: string; sectionId: string; onClick: () => void };

interface LandingHeaderProps {
  navItems: NavItem[];
  activeSection: string | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  navItems,
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header
      className="sticky top-0 z-50 w-full transition-shadow duration-200"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 1px 0 0 rgba(0,0,0,0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--landing-primary)] rounded-lg transition-transform active:scale-[0.98]"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
            style={{ backgroundColor: 'var(--landing-primary)' }}
          >
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight hidden sm:inline bg-gradient-to-r from-[#6b7280] via-[#4b5563] to-[#6b7280] bg-clip-text text-transparent">
            Goals and Development
          </span>
        </button>

        {/* Nav — desktop */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-0.5">
          {navItems.map((item) => {
            const isActive =
              'path' in item
                ? location.pathname === item.path
                : activeSection === item.sectionId;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="group relative px-4 py-2 text-sm font-bold rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--landing-primary)]"
              >
                <span
                  className={`relative z-10 bg-clip-text text-transparent transition-colors duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--landing-primary)] via-[var(--landing-primary)] to-[var(--landing-primary)]'
                      : 'bg-gradient-to-r from-[#6b7280] via-[#4b5563] to-[#6b7280] group-hover:from-[#4b5563] group-hover:via-[var(--landing-primary)] group-hover:to-[#4b5563]'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 origin-center rounded-full transition-transform duration-200 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  style={{ backgroundColor: 'var(--landing-primary)' }}
                  aria-hidden
                />
              </button>
            );
          })}
        </nav>

        {/* Right: CTA + mobile menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/about')}
            className="text-sm font-bold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--landing-primary)]"
          >
            <span className="relative z-10 bg-clip-text text-transparent transition-colors duration-150 bg-gradient-to-r from-[#6b7280] via-[#4b5563] to-[#6b7280]">
              Contact Us
            </span>
          </button>
          <AuthModal
            trigger={
              <Button
                size="sm"
                className="px-5 font-bold text-white shadow-sm transition-all duration-200 hover:shadow hover:scale-[1.02] active:scale-[0.98] hidden sm:inline-flex"
                style={{ backgroundColor: 'var(--landing-primary)' }}
              >
                Get Started
              </Button>
            }
            defaultMode="signup"
          />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-lg"
                style={{ color: 'var(--landing-text)' }}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] pt-8" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-bg)' }}>
              <nav className="flex flex-col gap-1 pt-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="flex items-center px-4 py-3 text-left text-sm font-bold rounded-lg transition-colors bg-gradient-to-r from-[#6b7280] via-[#4b5563] to-[#6b7280] bg-clip-text text-transparent"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--landing-border)' }} onClick={() => setMobileMenuOpen(false)}>
                  <AuthModal
                    trigger={
                      <Button
                        size="sm"
                        className="w-full rounded-full font-extrabold text-white"
                        style={{ backgroundColor: 'var(--landing-primary)' }}
                      >
                        Get Started
                      </Button>
                    }
                    defaultMode="signup"
                  />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
