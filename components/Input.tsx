import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border rounded-xl 
        focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
        text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
        outline-none transition-all duration-200 
        ${error ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};