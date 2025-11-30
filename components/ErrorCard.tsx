import React from 'react';
import { PrintError, ErrorSeverity, ErrorStatus } from '../types';

interface ErrorCardProps {
  error: PrintError;
  onClick: (error: PrintError) => void;
  isActive: boolean;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ error, onClick, isActive }) => {
  const isDismissed = error.status === ErrorStatus.DISMISSED;
  const isHighSeverity = error.severity === ErrorSeverity.HIGH;

  return (
    <button
      onClick={() => onClick(error)}
      className={`
        w-full text-left p-4 mb-3 rounded-lg border transition-all duration-200 group relative
        ${isActive ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}
        ${isDismissed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Index Circle */}
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white
            ${isDismissed ? 'bg-gray-300' : 'bg-orange-400'}
            ${!isDismissed && isHighSeverity ? 'bg-red-500' : ''}
          `}>
            {error.id}
          </div>
          <h3 className={`font-semibold text-lg ${isDismissed ? 'text-gray-500' : 'text-gray-800'}`}>
            {error.type}
          </h3>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 font-mono">
          Time: {error.timestamp}
        </div>
      </div>

      <div className="flex justify-between items-center pl-11">
        <div className="text-sm text-gray-600">
            Meter: <span className="font-medium text-gray-900">{error.meter}m</span>
        </div>
        {isHighSeverity && !isDismissed && (
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">High Severity</span>
        )}
      </div>

      {/* Active Indicator Line */}
      {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
      )}
    </button>
  );
};

export default ErrorCard;