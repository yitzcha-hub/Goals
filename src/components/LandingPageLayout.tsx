import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';

export type NavItem =
  | { label: string; path: string; onClick: () => void }
  | { label: string; sectionId: string; onClick: () => void };

const DEFAULT_NAV_CONFIG = [
  { label: 'Features', path: '/features' },
  { label: 'Use Cases', path: '/use-case' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About Us', path: '/about' },
  { label: 'FAQ', path: '/faq' },
];

interface LandingPageLayoutProps {
  children: React.ReactNode;
  navItems?: NavItem[];
}

/**
 * Wraps public pages (Features, Pricing, About, Contact, FAQ, UseCase).
 * When user is logged in: uses AuthenticatedLayout (AuthenticatedHeader).
 * When not logged in: uses LandingHeader with nav items.
 */
export const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({ children, navItems: navItemsProp }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (navItemsProp) return navItemsProp;
    return DEFAULT_NAV_CONFIG.map(({ label, path }) => ({
      label,
      path,
      onClick: () => {
        setMobileMenuOpen(false);
        navigate(path);
      },
    }));
  }, [navItemsProp, navigate]);

  const scrollToLandingSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    navigate('/');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [navigate]);

  if (user) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <LandingHeader
        navItems={navItems}
        activeSection={null}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      {children}
      <LandingFooter navigate={navigate} scrollToLandingSection={scrollToLandingSection} />
    </div>
  );
};
