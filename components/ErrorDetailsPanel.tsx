
import React, { useState } from 'react';
import { PrintError, ErrorStatus } from '../types';
import ErrorCard from './ErrorCard';
import { Icons } from './Icons';
import DefectDetailsPanel from './DefectDetailsPanel';

interface ErrorDetailsPanelProps {
  errors: PrintError[];
  selectedErrorId: string | null;
  onSelectError: (error: PrintError | null) => void; // Allow null to clear
  onIgnore: (error: PrintError) => void; // Trigger modal in App
  onReport: (error: PrintError) => void;
  onViewImage: (error: PrintError) => void;
  
  // Bulk Actions
  selectedIds: string[];
  onToggleBulkSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  
  // App specific ignore handler for detail view
  onIgnoreId: (id: string, reason: string) => void;
  onRestoreId: (id: string) => void;
  onReprint?: (id: string) => void;
  onLogMaintenance?: (id: string) => void;
}

const ErrorDetailsPanel: React.FC<ErrorDetailsPanelProps> = ({ 
  errors, selectedErrorId, onSelectError, onIgnore, onReport, onViewImage,
  selectedIds, onToggleBulkSelect, onSelectAll,
  onIgnoreId, onRestoreId, onReprint, onLogMaintenance
}) => {
  const [filterMode, setFilterMode] = useState<'All' | 'High'>('All');
  
  // Find selected error object
  const selectedError = errors.find(e => e.id === selectedErrorId);

  // If error selected, show Detail View
  if (selectedError) {
      return (
          <div className="w-[400px] border-l border-brand-border h-full shadow-xl z-20">
              <DefectDetailsPanel 
                  error={selectedError}
                  onClose={() => onSelectError(null)}
                  onIgnore={onIgnoreId}
                  onRestore={onRestoreId}
                  onViewImage={onViewImage}
                  onReprint={onReprint}
                  onLogMaintenance={onLogMaintenance}
              />
          </div>
      );
  }

  // --- List View Logic ---

  const activeErrors = errors.filter(e => e.status === ErrorStatus.ACTIVE).sort((a,b) => a.meter - b.meter);
  const filteredErrors = filterMode === 'High' 
    ? activeErrors.filter(e => e.severity === 'High' || e.severity === 'Critical')
    : activeErrors;

  const handleSelectAll = () => {
    if (selectedIds.length === filteredErrors.length) {
        onSelectAll([]);
    } else {
        onSelectAll(filteredErrors.map(e => e.id));
    }
  };

  return (
    <div className="w-[400px] bg-brand-panel border-l border-brand-border flex flex-col h-full shadow-xl z-20">
      
      {/* Header */}
      <div className="p-6 border-b border-brand-border">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-brand-dark">Detected Errors</h2>
            <span className="bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full">{activeErrors.length}</span>
         </div>
         
         {/* Filter Tabs */}
         <div className="flex gap-2 mb-4 bg-brand-bg p-1 rounded-lg">
             <button 
                onClick={() => setFilterMode('All')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${filterMode === 'All' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-body'}`}
             >
                All
             </button>
             <button 
                onClick={() => setFilterMode('High')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${filterMode === 'High' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-body'}`}
             >
                Critical Only
             </button>
         </div>

         {/* Bulk Actions Header */}
         <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-brand-border">
             <button onClick={handleSelectAll} className="flex items-center gap-2 text-xs font-medium text-brand-secondary hover:underline">
                {selectedIds.length === filteredErrors.length && filteredErrors.length > 0 ? <Icons.Checkbox className="w-4 h-4" /> : <Icons.Square className="w-4 h-4" />}
                Select All
             </button>
             {selectedIds.length > 0 && (
                 <div className="flex gap-2">
                     <button className="text-xs font-medium text-brand-muted hover:text-brand-primary">Ignore ({selectedIds.length})</button>
                 </div>
             )}
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 bg-brand-bg space-y-3">
         {filteredErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-brand-muted">
                <Icons.Check className="w-8 h-8 mb-2 text-status-success opacity-50" />
                <span className="text-sm">No active errors found.</span>
            </div>
         ) : (
             filteredErrors.map(error => (
                 <ErrorCard 
                    key={error.id}
                    error={error}
                    isSelected={false} // Selection now triggers detail view
                    isChecked={selectedIds.includes(error.id)}
                    onToggleCheck={() => onToggleBulkSelect(error.id)}
                    onClick={() => onSelectError(error)}
                    onIgnore={() => onIgnore(error)}
                    onReport={() => onReport(error)}
                    onImageClick={() => onViewImage(error)}
                 />
             ))
         )}
      </div>

    </div>
  );
};

export default ErrorDetailsPanel;
