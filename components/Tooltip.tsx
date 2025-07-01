
import React from 'react';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, disabled = false }) => {
  if (disabled) {
    return children;
  }
  
  return (
    <div className="relative flex items-center has-tooltip">
      {children}
      <div className="tooltip absolute bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-50 pointer-events-none">
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
