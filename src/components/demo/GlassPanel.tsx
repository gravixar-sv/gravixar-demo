import { cn } from "@/lib/cn";

export function GlassPanel({
  children,
  className,
  variant = "default",
  withChrome = false,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strong";
  withChrome?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        variant === "strong" ? "glass-strong" : "glass",
        withChrome && "pt-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
