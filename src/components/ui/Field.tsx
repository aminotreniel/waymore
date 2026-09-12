"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";
import { cx } from "@/lib/format";
import { IconChevronDown } from "@/components/icons";

const control =
  "w-full rounded-xl bg-white ring-1 ring-inset ring-line-strong px-3.5 text-[14.5px] text-heading placeholder:text-muted/70 transition-shadow focus:ring-2 focus:ring-ink-600 focus:outline-none disabled:bg-paper disabled:text-muted";

export function Label({
  children,
  htmlFor,
  hint,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-heading mb-1.5">
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
      {hint && <span className="font-normal text-muted ml-1.5">{hint}</span>}
    </label>
  );
}

export function Input({
  label,
  hint,
  error,
  required,
  prefix,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} hint={hint} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14.5px] text-muted pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={cx(control, "h-11", prefix && "pl-7", error && "ring-danger focus:ring-danger")}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  options,
  placeholder,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: (string | { value: string; label: string })[];
}) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} hint={hint} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          id={id}
          className={cx(control, "h-11 appearance-none pr-10", error && "ring-danger")}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const value = typeof o === "string" ? o : o.value;
            const label2 = typeof o === "string" ? o : o.label;
            return (
              <option key={value} value={value}>
                {label2}
              </option>
            );
          })}
        </select>
        <IconChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
      </div>
      {error && <p className="mt-1.5 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  required,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} hint={hint} required={required}>
          {label}
        </Label>
      )}
      <textarea id={id} rows={4} className={cx(control, "py-3 resize-y")} {...rest} />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  className,
}: {
  label: ReactNode;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label className={cx("flex gap-3 cursor-pointer group items-start", className)}>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cx(
            "grid size-5 place-items-center rounded-[7px] ring-1 ring-inset ring-line-strong bg-white transition-colors",
            "peer-checked:bg-ink-900 peer-checked:ring-ink-900 peer-focus-visible:ring-2 peer-focus-visible:ring-ink-600",
            "peer-checked:[&>svg]:opacity-100",
          )}
        >
          <svg viewBox="0 0 20 20" className="size-3 text-white opacity-0 transition-opacity" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 10.5 4 4 8-9" />
          </svg>
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] text-heading font-medium leading-snug">{label}</span>
        {description && <span className="block text-[12.5px] text-muted mt-0.5">{description}</span>}
      </span>
    </label>
  );
}

/** Large tappable radio card used throughout the seller funnel. */
export function ChoiceCard({
  label,
  description,
  selected,
  onSelect,
  icon,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        "text-left rounded-xl px-4 py-3.5 ring-1 ring-inset transition-all duration-150 w-full",
        selected
          ? "bg-mint-50 ring-2 ring-ink-800 shadow-card"
          : "bg-white ring-line-strong hover:ring-ink-200 hover:bg-paper",
      )}
    >
      <span className="flex items-start gap-3">
        {icon && <span className={cx("mt-0.5", selected ? "text-ink-800" : "text-muted")}>{icon}</span>}
        <span className="min-w-0">
          <span className="block text-[14.5px] font-semibold text-heading">{label}</span>
          {description && (
            <span className="block text-[12.5px] text-muted mt-0.5 leading-snug">{description}</span>
          )}
        </span>
      </span>
    </button>
  );
}
