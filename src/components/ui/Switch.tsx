'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Switch({ checked, onChange, disabled = false, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-105 active:scale-95
        ${checked
          ? 'bg-green-500 dark:bg-green-600'
          : 'bg-gray-300 dark:bg-gray-600'
        }
        ${className}
      `}
    >
      <span className="sr-only">Toggle notification</span>
      <span
        className={`
          absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md
          transition-all duration-200 ease-in-out
          ${checked ? 'left-0.5' : 'left-[22px]'}
        `}
      />
    </button>
  );
}
