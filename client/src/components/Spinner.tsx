import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  message?: string;
  fullPage?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-10 h-10 border-4',
  xl: 'w-12 h-12 border-4'
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'border-blue-500 border-t-transparent',
  secondary: 'border-gray-500 border-t-transparent',
  success: 'border-green-500 border-t-transparent',
  danger: 'border-red-500 border-t-transparent',
  warning: 'border-yellow-500 border-t-transparent',
  info: 'border-cyan-500 border-t-transparent',
  light: 'border-gray-200 border-t-transparent',
  dark: 'border-gray-800 border-t-transparent'
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  message = '',
  fullPage = false
}) => {
  const spinner = (
    <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
        {spinner}
        {message && <p className="mt-4 text-white">{message}</p>}
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center space-x-2">
        {spinner}
        <span>{message}</span>
      </div>
    );
  }

  return spinner;
};

export default Spinner;