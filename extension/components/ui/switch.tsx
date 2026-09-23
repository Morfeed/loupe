import { cn } from "../../src/core/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700",
      )}
    >
      <span className={cn("absolute left-1 top-1 size-4 rounded-full bg-white transition-transform", checked && "translate-x-5")} />
    </button>
  );
}
