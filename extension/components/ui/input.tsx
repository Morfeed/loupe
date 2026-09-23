import type { InputHTMLAttributes } from "react";
import { cn } from "../../src/core/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950", className)} {...props} />;
}
