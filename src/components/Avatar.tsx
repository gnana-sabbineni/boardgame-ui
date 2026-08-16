interface AvatarProps {
  firstName: string;
  lastName: string;
  variant?: "accent" | "neutral";
  size?: "sm" | "md";
}

export function Avatar({ firstName, lastName, variant = "neutral", size = "md" }: AvatarProps) {
  const initials = `${firstName.charAt(0) ?? ""}${lastName.charAt(0) ?? ""}`.toUpperCase();
  const dimensions = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";
  const colors = variant === "accent" ? "bg-accent-800 text-text" : "bg-white/10 text-text";

  return (
    <div className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full font-semibold ${colors}`}>
      {initials}
    </div>
  );
}