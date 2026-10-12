import { cn } from "cn";

export function Field({
  label,
  name,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  name?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium uppercase tracking-wide text-brass">
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      {error ? (
        <span className="text-xs text-red-400" role="alert">
          {error}
        </span>
      ) : null}
      {name ? <span className="sr-only">{name}</span> : null}
    </label>
  );
}

export const adminInputClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-on-dark outline-none focus-visible:border-brass focus-visible:ring-2 focus-visible:ring-brass/30";

export const adminTextareaClass =
  "min-h-24 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2 text-sm text-text-on-dark outline-none focus-visible:border-brass focus-visible:ring-2 focus-visible:ring-brass/30";
