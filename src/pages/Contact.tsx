import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LandingHeader } from '@/components/LandingHeader';
import { LandingFooter } from '@/components/LandingFooter';

export default function Contact() {
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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Message Sent!',
        description: 'We\'ll get back to you within 24 hours.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <LandingHeader
        navItems={navItems}
        activeSection={null}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="py-16 px-4" style={{ backgroundColor: 'var(--landing-accent)' }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--landing-text)' }}>Contact Us</h1>
          <p className="text-lg opacity-90" style={{ color: 'var(--landing-text)' }}>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll respond within 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <Input
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className={errors.subject ? 'border-red-500' : ''}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>
                
                <div>
                  <Textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={errors.message ? 'border-red-500' : ''}
                    rows={6}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <Button type="submit" className="w-full text-white" style={{ backgroundColor: 'var(--landing-primary)' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1" style={{ color: 'var(--landing-primary)' }} />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:support@depogoals.com" className="hover:underline" style={{ color: 'var(--landing-primary)' }}>
                      support@depogoals.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1" style={{ color: 'var(--landing-primary)' }} />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a href="tel:+1234567890" className="hover:underline" style={{ color: '#2c9d73' }}>
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1" style={{ color: 'var(--landing-primary)' }} />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-sm text-gray-600">123 Success Street<br />Goal City, GC 12345</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                     className="p-2 rounded-full transition" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <Facebook className="w-5 h-5" style={{ color: 'var(--landing-primary)' }} />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                     className="p-2 rounded-full transition" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <Twitter className="w-5 h-5" style={{ color: 'var(--landing-primary)' }} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                     className="p-2 rounded-full transition" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <Linkedin className="w-5 h-5" style={{ color: 'var(--landing-primary)' }} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                     className="p-2 rounded-full transition" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <Instagram className="w-5 h-5" style={{ color: 'var(--landing-primary)' }} />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about Goals and Development</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What is Goals and Development?</h3>
              <p className="text-gray-600">Goals and Development is a private personal growth system that helps you set goals, create a written plan, stay accountable, and measure your progress over time.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I get started?</h3>
              <p className="text-gray-600">Simply sign up for a free account, complete the onboarding process, and start creating your first goals. You can choose from templates or create custom goals tailored to your needs.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a mobile app?</h3>
              <p className="text-gray-600">Yes! DEPO Goals is a Progressive Web App (PWA) that works seamlessly on mobile devices. You can install it directly from your browser for a native app-like experience.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I collaborate with family members?</h3>
              <p className="text-gray-600">Absolutely! Create family groups, share goals, track progress together, and celebrate achievements as a team. Our collaboration features make it easy to stay connected.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">What subscription plans are available?</h3>
              <p className="text-gray-600">We offer a 7-day free trial, then Monthly and Annual plans. Visit our pricing section on the home page to see which plan is right for you.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-600">You can cancel your subscription anytime from your account settings. Your access will continue until the end of your billing period.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <LandingFooter navigate={navigate} scrollToLandingSection={scrollToLandingSection} />
    </div>
  );
}
