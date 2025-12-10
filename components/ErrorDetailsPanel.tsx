import React, { useState } from 'react';
import { PrintError, ErrorStatus } from '../types';
import ErrorCard from './ErrorCard';
import { Icons } from './Icons';

interface ErrorDetailsPanelProps {
  errors: PrintError[];
  selectedErrorId: string | null;
  onSelectError: (error: PrintError) => void;
  onIgnore: (error: PrintError) => void;
  onReport: (error: PrintError) => void;
  onViewImage: (error: PrintError) => void;
  
  // Bulk Actions
  selectedIds: string[];
  onToggleBulkSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

const ErrorDetailsPanel: React.FC<ErrorDetailsPanelProps> = ({ 
  errors, selectedErrorId, onSelectError, onIgnore, onReport, onViewImage,
  selectedIds, onToggleBulkSelect, onSelectAll
}) => {
  const activeErrors = errors.filter(e => e.status === ErrorStatus.ACTIVE).sort((a,b) => a.meter - b.meter);
  const [filterMode, setFilterMode] = useState<'All' | 'High'>('All');

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
    <div className="w-[400px] bg-white border-l border-brand-lightGray flex flex-col h-full shadow-xl z-20">
      
      {/* Header */}
      <div className="p-6 border-b border-brand-lightGray">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-h2 text-brand-dark">Detected Errors</h2>
            <span className="bg-status-error text-white text-xs font-bold px-2 py-1 rounded-full">{activeErrors.length}</span>
         </div>
         
         {/* Filter Tabs */}
         <div className="flex gap-2 mb-4">
             <button 
                onClick={() => setFilterMode('All')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${filterMode === 'All' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-gray'}`}
             >
                All
             </button>
             <button 
                onClick={() => setFilterMode('High')}
                className={`px-3 py-1 rounded-full text-xs font-medium ${filterMode === 'High' ? 'bg-brand-dark text-white' : 'bg-gray-100 text-brand-gray'}`}
             >
                Critical & High Only
             </button>
         </div>

         {/* Bulk Actions Header */}
         <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-brand-lightGray">
             <button onClick={handleSelectAll} className="flex items-center gap-2 text-label text-brand-blue hover:underline">
                {selectedIds.length === filteredErrors.length && filteredErrors.length > 0 ? <Icons.Checkbox className="w-4 h-4" /> : <Icons.Square className="w-4 h-4" />}
                Select All
             </button>
             {selectedIds.length > 0 && (
                 <div className="flex gap-2">
                     <button className="text-label text-brand-gray hover:text-brand-blue">Ignore ({selectedIds.length})</button>
                 </div>
             )}
         </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 bg-brand-bg">
         {filteredErrors.length === 0 ? (
            <div className="text-center text-brand-gray py-10">No active errors found.</div>
         ) : (
             filteredErrors.map(error => (
                 <ErrorCard 
                    key={error.id}
                    error={error}
                    isSelected={selectedErrorId === error.id}
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