import { useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput = ({ value, onChange, disabled }: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').split('').slice(0, 6);

  const updateDigit = (index: number, digit: string) => {
    const next = digits.map((d, i) => (i === index ? digit : d));
    onChange(next.join('').replace(/\s/g, ''));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    updateDigit(index, digit);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors
            border-slate-200 focus:border-blue-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
};
