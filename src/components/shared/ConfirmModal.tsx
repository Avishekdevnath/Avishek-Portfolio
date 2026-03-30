import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#e8e3db] rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-[0.95rem] font-semibold text-[#2a2118] mb-1">{title}</h3>
        {description && <p className="text-[0.82rem] text-[#6b5c4e] leading-relaxed mb-6">{description}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3.5 py-2 text-[0.78rem] text-[#4a3728] border border-[#e8e3db] rounded-lg hover:bg-[#f3f1ee] disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3.5 py-2 text-[0.78rem] bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deleting…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 