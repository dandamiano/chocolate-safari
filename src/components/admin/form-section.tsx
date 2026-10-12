import { cn } from "cn";

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-xl border border-border/80 bg-bg-elevated/40 p-5 sm:p-6",
        className
      )}
    >
      <header className="space-y-1 border-b border-border/60 pb-3">
        <h2 className="font-display text-lg text-brass">{title}</h2>
        {description ? (
          <p className="text-sm text-text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
