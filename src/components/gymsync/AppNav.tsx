import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Plan" },
  { to: "/body", label: "My Body" },
] as const;

export function AppNav() {
  return (
    <nav className="flex items-center gap-1 rounded-md border border-border bg-card/50 p-1">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: true }}
          className={cn(
            "rounded px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors",
            "text-muted-foreground hover:text-foreground",
          )}
          activeProps={{
            className: "bg-primary text-primary-foreground hover:text-primary-foreground",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
