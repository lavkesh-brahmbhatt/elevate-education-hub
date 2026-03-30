import { ReactNode } from 'react';

export function StatCard({ label, value, subtitle, icon }: { label: string; value: string | number; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="bg-card rounded-xl shadow-card p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <p className="label-text">{label}</p>
        {icon && <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>}
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
