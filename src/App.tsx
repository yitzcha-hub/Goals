import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { StorageModeProvider } from "@/contexts/StorageModeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import GetStarted from "./pages/GetStarted";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { EmailVerification } from "./pages/EmailVerification";
import { AuthCallback } from "./pages/AuthCallback";
import Demo from "./pages/Demo";
import Help from "./pages/Help";
import Forums from "./pages/Forums";

import Calendar from "./pages/Calendar";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import UseCase from "./pages/UseCase";
import FAQ from "./pages/FAQ";
import Settings from "./pages/Settings";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <StorageModeProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/getstarted" element={<ProtectedRoute><GetStarted /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/features" element={<Features />} />
              <Route path="/use-case" element={<UseCase />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Protected routes - require login, redirect to / if not authenticated */}
              <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
              <Route path="/forums" element={<ProtectedRoute><Forums /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />


              <Route path="*" element={<NotFound />} />
            </Routes>
            </StorageModeProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;