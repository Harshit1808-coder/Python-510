
import React from 'react';
import { UserRole } from '../types';

interface LandingPageProps {
  onNavigate: (view: { name: 'auth', role: UserRole, form: 'login' }) => void;
}

const PawIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 12.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl">
        <PawIcon className="h-24 w-24 text-emerald-600 mx-auto mb-4" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-4">
          Welcome to <span className="text-emerald-600">Guardian Paws</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Connecting heroes with animals in need. Report an injured animal or join as an NGO to make a difference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">For Users</h2>
            <p className="text-gray-600 mb-6">
              Found an animal in distress? Report it quickly with a photo and location to alert nearby rescue teams.
            </p>
            <button
              onClick={() => onNavigate({ name: 'auth', role: UserRole.USER, form: 'login' })}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-200"
            >
              User Login / Register
            </button>
          </div>

          {/* NGO Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">For NGOs</h2>
            <p className="text-gray-600 mb-6">
              Join our network to receive real-time alerts for animals in need in your area and manage rescue operations.
            </p>
            <button
              onClick={() => onNavigate({ name: 'auth', role: UserRole.NGO, form: 'login' })}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 duration-200"
            >
              NGO Login / Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
