import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { StorageModeProvider } from "@/contexts/StorageModeContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { EmailVerification } from "./pages/EmailVerification";
import { AuthCallback } from "./pages/AuthCallback";
import Demo from "./pages/Demo";
import Help from "./pages/Help";
import Forums from "./pages/Forums";

import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import PaymentSuccessPage from "./pages/PaymentSuccess";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
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
              <Route path="/demo" element={<Demo />} />

              <Route path="/help" element={<Help />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />









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