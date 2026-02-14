/**
 * CustomSelect Component
 *
 * Custom styled dropdown that replaces native <select> elements.
 * Keyboard navigable, ARIA accessible, animated.
 *
 * @module components/ui/CustomSelect
 */

'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  options: CustomSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  id?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  label,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const opt = options[highlightedIndex];
            if (!opt.disabled) {
              onChange?.(opt.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next].disabled) next++;
              return next < options.length ? next : prev;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          className="mb-1.5 block text-sm font-medium text-foreground"
          htmlFor={id}
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm',
          'transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          disabled && 'cursor-not-allowed opacity-50',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span
          className={cn(
            'flex items-center gap-2 truncate',
            !selectedOption && 'text-muted-foreground'
          )}
        >
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Options panel */}
      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="animate-dropdown-enter absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-background py-1 shadow-xl"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                value === option.value &&
                  'bg-primary/10 font-medium text-primary',
                highlightedIndex === index && 'bg-muted',
                option.disabled && 'cursor-not-allowed opacity-50',
                !option.disabled && 'hover:bg-muted'
              )}
              onClick={() => !option.disabled && handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <span className="flex-1 truncate">{option.label}</span>
              {value === option.value && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

CustomSelect.displayName = 'CustomSelect';
