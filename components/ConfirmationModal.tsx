import React, { useState } from 'react';
import { Icons } from './Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, operatorId: string) => void;
  title: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [reason, setReason] = useState('');
  const [operatorId, setOperatorId] = useState('');

  if (!isOpen) return null;

  const isValid = reason.length > 3 && operatorId.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-4 text-status-warning">
             <Icons.Alert className="w-6 h-6" />
             <h2 className="text-h2 text-brand-dark">{title}</h2>
          </div>
          
          <p className="text-body text-brand-gray mb-6">
             Please provide a reason for ignoring this defect. This action will be logged.
          </p>

          <div className="space-y-4 mb-6">
             <div>
                <label className="block text-label text-brand-dark mb-1">Reason for Ignoring <span className="text-status-error">*</span></label>
                <input 
                   type="text" 
                   className="w-full border border-brand-lightGray rounded p-2 text-body focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                   placeholder="e.g. False positive, Test pattern"
                   value={reason}
                   onChange={e => setReason(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-label text-brand-dark mb-1">Operator ID <span className="text-status-error">*</span></label>
                <select 
                   className="w-full border border-brand-lightGray rounded p-2 text-body focus:border-brand-blue outline-none bg-white"
                   value={operatorId}
                   onChange={e => setOperatorId(e.target.value)}
                >
                   <option value="">Select Operator...</option>
                   <option value="OP-001">OP-001 (John D.)</option>
                   <option value="OP-002">OP-002 (Sarah M.)</option>
                   <option value="ADMIN">Administrator</option>
                </select>
             </div>
          </div>

          <div className="flex gap-3 justify-end">
             <button onClick={onClose} className="px-4 py-2 rounded text-brand-dark hover:bg-gray-100 font-medium">Cancel</button>
             <button 
                onClick={() => isValid && onConfirm(reason, operatorId)}
                disabled={!isValid}
                className={`px-4 py-2 rounded text-white font-medium transition-colors ${isValid ? 'bg-brand-blue hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
             >
                Confirm Ignore
             </button>
          </div>
       </div>
    </div>
  );
};

export default ConfirmationModal;