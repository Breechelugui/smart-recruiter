import React, { useState } from 'react';

const AnimatedCard = ({ 
  children, 
  className = '', 
  hover = true, 
  delay = 0,
  animation = 'fadeInUp' 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const animationClasses = {
    fadeInUp: 'animate-fadeInUp',
    fadeInLeft: 'animate-fadeInLeft',
    fadeInRight: 'animate-fadeInRight',
    fadeInDown: 'animate-fadeInDown',
    scaleIn: 'animate-scaleIn',
    slideInUp: 'animate-slideInUp'
  };

  const hoverClasses = hover ? `
    transition-all duration-300 ease-in-out
    ${isHovered ? 'transform -translate-y-1 shadow-2xl' : 'shadow-lg'}
  ` : '';

  const baseClasses = `
    bg-white rounded-2xl border border-gray-200
    ${animationClasses[animation]}
    ${hoverClasses}
    ${className}
  `;

  return (
    <div
      className={baseClasses}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
