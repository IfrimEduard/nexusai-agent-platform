import React from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-cyan-500" : "bg-[#1e2d3d]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full transition-transform duration-200 ${
          enabled
            ? "translate-x-4 bg-white"
            : "translate-x-0.5 bg-slate-500"
        }`}
      />
    </button>
  );
};

export default Toggle;