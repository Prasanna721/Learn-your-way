interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label?: string;
}

export default function CustomSlider({ value, min, max, step, onChange, label }: CustomSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <label className="text-black text-sm font-semibold block mb-2">
          {label}
        </label>
      )}
      <div className="relative w-full h-2">
        {/* Background track */}
        <div className="absolute inset-0 bg-black/10 rounded-full" />

        {/* Filled track */}
        <div
          className="absolute left-0 top-0 h-full bg-[var(--brand-coral)] rounded-full transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-5 bg-[var(--brand-coral-darkest)] rounded-full cursor-pointer transition-all duration-150"
          style={{ left: `${percentage}%` }}
        />

        {/* Invisible input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
}
