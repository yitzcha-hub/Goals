import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  onSelect: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  isPopular = false,
  onSelect
}) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:shadow-xl ${
      isPopular ? 'border-blue-500 transform scale-105' : 'border-gray-200 hover:border-blue-300'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/{period}</span>
        </div>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={onSelect}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
          isPopular
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
        }`}
      >
        {title === 'Free Trial' ? 'Start Free Trial' : 'Choose Plan'}
      </button>
    </div>
  );
};