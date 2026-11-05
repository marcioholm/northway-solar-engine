'use client';

import { useState } from 'react';
import { cn } from '../../lib/cn';

type InputVariant = 'text' | 'number' | 'search' | 'select' | 'textarea';

interface InputProps {
  variant?: InputVariant;
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  options?: { label: string; value: string }[];
  step?: string;
  min?: number;
  max?: number;
  onFocus?: (e: React.FocusEvent<any>) => void;
  onBlur?: (e: React.FocusEvent<any>) => void;
}

export function Input({
  variant = 'text', label, placeholder, value, onChange,
  error, disabled, required, className, style, id, options, step, min, max,
  onFocus, onBlur,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [localText, setLocalText] = useState<string | null>(null);

  const formatExternalValue = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number' && Number.isNaN(val)) return '';
    if (val === 'NaN') return '';
    return String(val);
  };

  const baseStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'var(--bg)',
    border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--green)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: focused ? '0 0 0 3px rgba(143, 214, 58, 0.15)' : 'none',
    cursor: disabled ? 'not-allowed' : undefined,
    opacity: disabled ? 0.5 : 1,
  };

  const labelId = id || `input-${Math.random().toString(36).slice(2, 8)}`;

  const displayValue = variant === 'number'
    ? (focused && localText !== null ? localText : formatExternalValue(value))
    : formatExternalValue(value);

  const handleNumberChange = (raw: string) => {
    // Permita '-' somente no início
    const isNegative = raw.startsWith('-');
    let withoutMinus = raw.replace(/-/g, '');
    // Permita apenas dígitos, ponto e vírgula
    withoutMinus = withoutMinus.replace(/[^0-9.,]/g, '');

    // Permita apenas um separador decimal (. ou ,)
    let seenSep = false;
    let filteredChars = '';
    for (const ch of withoutMinus) {
      if (ch === '.' || ch === ',') {
        if (!seenSep) {
          filteredChars += ch;
          seenSep = true;
        }
      } else {
        filteredChars += ch;
      }
    }

    const currentText = (isNegative ? '-' : '') + filteredChars;
    setLocalText(currentText);

    // Para "", "-", "." e "-.", chame onChange com "" e mantenha o texto na tela.
    const isIntermediate =
      currentText === '' ||
      currentText === '-' ||
      currentText === '.' ||
      currentText === '-.' ||
      currentText === ',' ||
      currentText === '-,';

    if (isIntermediate) {
      onChange?.('');
    } else {
      // Para os demais casos, chame onChange com o número em texto, normalizando vírgula para ponto.
      const normalized = currentText.replace(/,/g, '.');
      onChange?.(normalized);
    }
  };

  const handleFocus = (e: React.FocusEvent<any>) => {
    setFocused(true);
    if (variant === 'number') {
      setLocalText(formatExternalValue(value));
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    setFocused(false);
    if (variant === 'number') {
      setLocalText(null);
    }
    onBlur?.(e);
  };

  return (
    <div className={cn(className)} style={style}>
      {label && (
        <label
          htmlFor={labelId}
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-secondary-v2)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '6px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      {variant === 'select' ? (
        <select
          id={labelId}
          value={displayValue}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...baseStyle, appearance: 'none', paddingRight: '32px' }}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : variant === 'textarea' ? (
        <textarea
          id={labelId}
          placeholder={placeholder}
          value={displayValue}
          onChange={e => onChange?.(e.target.value)}
          disabled={disabled}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...baseStyle, minHeight: '80px', resize: 'vertical' }}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          {variant === 'search' && (
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', fontSize: '16px', pointerEvents: 'none',
            }}>
              ⌕
            </span>
          )}
          <input
            id={labelId}
            type="text"
            inputMode={variant === 'number' ? 'decimal' : undefined}
            placeholder={placeholder}
            value={displayValue}
            onChange={e => {
              if (variant === 'number') {
                handleNumberChange(e.target.value);
              } else {
                onChange?.(e.target.value);
              }
            }}
            disabled={disabled}
            required={required}
            onFocus={handleFocus}
            onBlur={handleBlur}
            step={step}
            min={min}
            max={max}
            style={{
              ...baseStyle,
              paddingLeft: variant === 'search' ? '36px' : '14px',
            }}
          />
        </div>
      )}
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', margin: '4px 0 0' }}>{error}</p>
      )}
    </div>
  );
}
