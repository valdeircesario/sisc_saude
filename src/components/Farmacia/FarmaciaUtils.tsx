import React from "react";

// ─── Field Component ───────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ id, label, children }) => (
  <div className="mb-5">
    <label
      htmlFor={id}
      className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide"
    >
      {label}
    </label>
    {children}
  </div>
);

// ─── Input Class Constant ──────────────────────────────────────────────────

export const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white";

// ─── InfoItem Component ────────────────────────────────────────────────────

interface InfoItemProps {
  label: string;
  value: string;
  fullWidth?: boolean;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  fullWidth,
}) => (
  <div className={fullWidth ? "col-span-2" : ""}>
    <span className="block text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

// ─── NavButton Component ──────────────────────────────────────────────────

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
      active
        ? "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md shadow-indigo-200"
        : "text-gray-500 hover:bg-red-50 hover:text-red-600"
    }`}
  >
    {icon}
    {label}
  </button>
);

// ─── RadioOption Component ─────────────────────────────────────────────────

interface RadioOptionProps {
  value: "completa" | "parcial";
  current: "completa" | "parcial";
  onChange: (v: "completa" | "parcial") => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export const RadioOption: React.FC<RadioOptionProps> = ({
  value,
  current,
  onChange,
  icon,
  title,
  subtitle,
}) => {
  const isSelected = current === value;
  const selectedClass =
    value === "completa"
      ? "border-red-500 bg-red-50"
      : "border-amber-400 bg-amber-50";
  const dotClass =
    value === "completa"
      ? "border-red-500 bg-red-500"
      : "border-amber-400 bg-amber-400";

  return (
    <label
      className={`flex-1 flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
        isSelected ? selectedClass : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="radio"
        name="status"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          isSelected ? dotClass : "border-gray-300"
        }`}
      >
        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <strong className="block text-xs font-semibold text-gray-700">
          {title}
        </strong>
        <small className="text-[0.68rem] text-gray-400">{subtitle}</small>
      </div>
      {icon}
    </label>
  );
};
