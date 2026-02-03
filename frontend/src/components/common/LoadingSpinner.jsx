import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'purple', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div 
          className={`
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            animate-spin 
            rounded-full 
            border-2 
            border-opacity-20
          `}
          style={{
            borderTopColor: 'currentColor',
            borderRightColor: 'currentColor',
            borderBottomColor: 'currentColor',
            borderLeftColor: 'transparent'
          }}
        />
        
        {/* Inner spinning ring (counter-rotation) */}
        <div 
          className={`
            absolute inset-0 
            ${sizeClasses[size]} 
            ${colorClasses[color]} 
            animate-spin 
            rounded-full 
            border-2 
            border-opacity-10
          `}
          style={{
            animationDirection: 'reverse',
            borderTopColor: 'transparent',
            borderRightColor: 'currentColor',
            borderBottomColor: 'currentColor',
            borderLeftColor: 'currentColor'
          }}
        />
        
        {/* Center dot */}
        <div 
          className={`
            absolute inset-0 
            flex items-center justify-center
          `}
        >
          <div 
            className={`
              ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'}
              ${colorClasses[color]}
              rounded-full
              animate-pulse
            `}
          />
        </div>
      </div>
      
      {showText && text && (
        <p className={`mt-3 ${colorClasses[color]} ${textSizeClasses[size]} font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
