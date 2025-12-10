import React from 'react';
import { Icons } from './Icons';
import { ViewType } from '../types';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative
      ${isActive ? 'bg-brand-lightGray/30 text-brand-blue font-semibold' : 'text-brand-gray hover:bg-gray-100'}
    `}
  >
    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue" />}
    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-blue' : 'text-brand-gray'}`} />
    <span className="text-body">{label}</span>
  </button>
);

interface LeftNavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="w-[200px] bg-white border-r border-brand-lightGray flex flex-col h-full flex-shrink-0 z-20">
      <div className="p-6 flex items-center gap-2 mb-4">
         {/* Small HP Logo integration */}
         <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" 
            alt="HP" 
            className="w-8 h-8"
         />
      </div>
      
      <div className="flex-1 space-y-1">
        <NavItem 
          icon={Icons.Home} 
          label="Dashboard" 
          isActive={currentView === 'dashboard'} 
          onClick={() => onNavigate('dashboard')} 
        />
        <NavItem 
          icon={Icons.Jobs} 
          label="Active Job" 
          isActive={currentView === 'activeJob'} 
          onClick={() => onNavigate('activeJob')} 
        />
        <NavItem 
          icon={Icons.BarChart} 
          label="Reports" 
          isActive={currentView === 'reports'} 
          onClick={() => onNavigate('reports')} 
        />
        <NavItem 
          icon={Icons.Training} 
          label="Training" 
          isActive={currentView === 'training'} 
          onClick={() => onNavigate('training')} 
        />
      </div>

      <div className="border-t border-brand-lightGray pt-2 pb-6">
        <NavItem 
          icon={Icons.Settings} 
          label="Settings" 
          isActive={currentView === 'settings'} 
          onClick={() => onNavigate('settings')} 
        />
      </div>
    </div>
  );
};

export default LeftNavigation;