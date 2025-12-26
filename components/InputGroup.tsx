
import React, { useState, useEffect } from 'react';

interface InputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  suffix?: string;
  prefix?: string;
  step?: number;
  min?: number;
}

export const InputField: React.FC<InputProps> = ({ 
  label, value, onChange, suffix, prefix, step = 1, min = 0 
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());

  useEffect(() => {
    const numericDisplay = parseFloat(displayValue);
    if (isNaN(numericDisplay) || numericDisplay !== value) {
      setDisplayValue(value === 0 && displayValue === "" ? "" : value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);

    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  const prClass = suffix ? (suffix.length > 3 ? 'pr-20' : 'pr-12') : 'pr-4';

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {/* h-4 garante que mesmo labels vazias ocupem espaço vertical */}
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider min-h-[1rem]">
        {label.trim() ? label : ""}
      </label>
      <div className="relative group">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors font-medium">
            {prefix}
          </div>
        )}
        <input
          type="number"
          step={step}
          min={min}
          value={displayValue}
          onChange={handleInputChange}
          placeholder="0"
          className={`w-full bg-white border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-semibold ${prefix ? 'pl-9' : ''} ${prClass}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase tracking-tight pointer-events-none opacity-70">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};
