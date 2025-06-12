
import React from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import ModuleCard from '@/components/modules/ModuleCard';
import { AlertTriangle, Building, Clock, Wrench, Wallet, Phone } from 'lucide-react';

/**
 * ModulesPage Component
 * 
 * The neighborhood module hub that showcases available add-on modules
 * for neighborhoods to enhance their community functionality.
 * This acts as a showcase for upcoming features in a card-based interface.
 * 
 * Updated to use light gray background instead of gradient and match Home page styling.
 */

// Module definitions with their metadata
const modules = [
  {
    id: 'emergency-prep',
    name: 'Emergency Prep',
    tagline: 'Ready for Anything',
    description: 'A neighborhood-wide emergency preparedness module that helps everyone get prepared for your unique local hazards.',
    icon: AlertTriangle, // Changed from Shield to AlertTriangle for better emergency representation
    accentColor: 'red',
    status: 'coming-soon'
  },
  {
    id: 'town-hall',
    name: 'Town Hall',
    tagline: 'Stay Informed',
    description: 'A summarizer of town hall transcripts that presents key insights and action items for neighbors to take.',
    icon: Building,
    accentColor: 'blue',
    status: 'coming-soon'
  },
  {
    id: 'time-banking',
    name: 'Time Banking',
    tagline: 'Trade Time, Build Community',
    description: 'Exchange services using time as currency. Help neighbors and earn time credits for when you need assistance.',
    icon: Clock,
    accentColor: 'green',
    status: 'coming-soon'
  },
  {
    id: 'tool-library',
    name: 'Tool Library',
    tagline: 'Borrow Instead of Buy',
    description: 'A lending module to help neighbors borrow instead of buy. Share tools, equipment, and resources with your community.',
    icon: Wrench,
    accentColor: 'orange',
    status: 'coming-soon'
  },
  {
    id: 'neighborhood-treasuries',
    name: 'Neighborhood Treasuries',
    tagline: 'Fund Community Action',
    description: 'Onchain treasuries to help fund and fundraise local activities and action. Transparent community financing.',
    icon: Wallet,
    accentColor: 'purple',
    status: 'coming-soon'
  },
  {
    id: 'call-your-rep',
    name: 'Call Your Rep',
    tagline: 'Make Your Voice Heard',
    description: 'A module to help you call your local, state, and federal representatives. Easy civic engagement tools.',
    icon: Phone,
    accentColor: 'teal',
    status: 'coming-soon'
  }
];

const ModulesPage = () => {
  return (
    // Light gray background container instead of gradient
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 sm:px-6 lg:px-8 pt-6 pb-10 max-w-7xl mx-auto">
        {/* Header section with Home page styling */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Modules</h1>
          
          {/* Description box matching other pages */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
            <p className="text-gray-600 leading-relaxed">
              Discover add-on modules to enhance your neighborhood's functionality and build stronger community connections.
            </p>
          </div>
        </div>

        {/* Modules grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-2">
            About Neighborhood Modules
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            These modules are community-built add-ons that neighborhoods can integrate to enhance 
            their local experience. The core pages (Calendar, Skills, Freebies, Updates, Neighbors) 
            are enabled by default as the foundation for healthy communities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;
