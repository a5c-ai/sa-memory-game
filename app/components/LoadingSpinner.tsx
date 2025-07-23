'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <div className={`${spinnerSize} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-2`}></div>
      {message && (
        <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
      )}
    </div>
  );
}