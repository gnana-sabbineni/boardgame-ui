import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, className = "", ...props }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-text/70">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-text outline-none placeholder:text-text/30 focus:border-accent ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}