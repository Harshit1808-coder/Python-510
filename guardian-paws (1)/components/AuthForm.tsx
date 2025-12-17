
import React, { useState } from 'react';
import { UserRole } from '../types';

interface AuthFormProps {
  formType: 'login' | 'register';
  userRole: UserRole;
  onSubmit: (formData: Record<string, string>) => void;
  onSwitchForm: () => void;
  loading: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, userRole, onSubmit, onSwitchForm, loading }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    email: '',
    password: '',
    ...(formType === 'register' && { name: '' }),
    ...(formType === 'register' && userRole === UserRole.NGO && { location: '' }),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isRegister = formType === 'register';
  const title = `${isRegister ? 'Register' : 'Login'} as ${userRole === UserRole.USER ? 'a User' : 'an NGO'}`;
  const buttonText = isRegister ? 'Create Account' : 'Login';
  const switchText = isRegister ? 'Already have an account?' : "Don't have an account?";

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isRegister && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {userRole === UserRole.USER ? 'Your Name' : 'NGO Name'}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        )}
        {isRegister && userRole === UserRole.NGO && (
           <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location (e.g. City, State)
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              value={formData.location || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300"
        >
          {loading ? 'Processing...' : buttonText}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        {switchText}{' '}
        <button onClick={onSwitchForm} className="font-medium text-emerald-600 hover:text-emerald-500">
          {isRegister ? 'Login here' : 'Register here'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
