import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: string;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, width = "max-w-md", children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        className={`relative ${width} w-full mx-4 bg-[#111827] border border-[#1e2d3d] rounded-xl shadow-xl opacity-100 animate-[fadeIn_200ms_ease-out]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d3d]">
          <h2 className="text-sm font-medium text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[80vh] px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;