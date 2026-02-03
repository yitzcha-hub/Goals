import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PricingSection from '@/components/PricingSection';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      <div className="bg-white/90 backdrop-blur-md shadow-sm py-4 px-4 sticky top-0 z-50 border-b border-green-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-400 rounded-xl flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-lime-500 bg-clip-text text-transparent">
              Goals and Development
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-green-700 hover:text-green-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
      <PricingSection />
    </div>
  );
};

export default Pricing;
