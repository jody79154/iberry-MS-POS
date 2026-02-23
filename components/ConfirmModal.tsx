import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
    info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
  };

  const iconClasses = {
    danger: 'text-red-500 bg-red-50 dark:bg-red-500/10',
    warning: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
    info: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className={`p-3 rounded-2xl ${iconClasses[variant]}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {title}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all active:scale-95 ${variantClasses[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
