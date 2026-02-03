'use client';

import React from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CurrencyInput({
  label,
  error,
  helperText,
  className = '',
  id,
  value,
  onChange,
  ...props
}: CurrencyInputProps) {
  const inputId = id || props.name;

  // Format number with thousand separators (dots)
  const formatNumber = (val: string | number): string => {
    if (!val) return '';
    const numStr = val.toString().replace(/\D/g, ''); // Remove non-digits
    if (!numStr) return '';
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse formatted number to plain number string
  const parseNumber = (val: string): string => {
    return val.replace(/\./g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const plainNumber = parseNumber(inputValue);
    
    // Create a new event with the plain number value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: plainNumber,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(newEvent);
  };

  const displayValue = formatNumber(value);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          Rp
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className={`
            w-full pl-10 pr-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
