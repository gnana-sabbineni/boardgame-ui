import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, id, type, className = "", ...props }: TextFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (isRevealed ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-text/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full rounded-lg border border-white/10 bg-bg px-3 py-2.5 text-text outline-none placeholder:text-text/30 focus:border-accent ${isPassword ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsRevealed((r) => !r)}
            aria-label={isRevealed ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text"
          >
            {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}