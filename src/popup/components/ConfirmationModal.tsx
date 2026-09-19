import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, RotateCcw, X } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'primary';

export interface ConfirmationOptions {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  note?: React.ReactNode;
}

export interface ConfirmationModalProps extends ConfirmationOptions {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  icon,
  children,
  note,
  isLoading = false,
}: ConfirmationModalProps) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400',
          defaultIcon: <Trash2 className="w-4 h-4" />,
          buttonBg: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'info':
      case 'primary':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
          defaultIcon: <Info className="w-4 h-4" />,
          buttonBg: 'bg-accent hover:bg-accent-hover text-white',
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
          defaultIcon: <AlertTriangle className="w-4 h-4" />,
          buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
        };
    }
  };

  const { iconBg, defaultIcon, buttonBg } = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        className="w-full max-w-[325px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 p-4 space-y-3.5 animate-in zoom-in-95 duration-150"
      >
        {/* Header with Icon and Title */}
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
            {icon || defaultIcon}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h4 id="confirmation-modal-title" className="font-semibold text-xs text-slate-900 dark:text-white leading-tight">
              {title}
            </h4>
            {description && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Custom Details / Breakdown (Optional) */}
        {children && <div className="space-y-2">{children}</div>}

        {/* Warning Note (Optional) */}
        {note && (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded-md border border-amber-200/50 dark:border-amber-900/40">
            {note}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-lg font-medium text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 ${buttonBg} ${
              isLoading ? 'opacity-50 cursor-wait' : ''
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
