import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/DashboardWidgets';

export default function ParentDashboard() {
  const { profile } = useAuth();
  return (
    <div className="animate-fade-in">
      <PageHeader title="Parent Dashboard" description="Monitor your child's academic progress." />
      <div className="bg-card rounded-xl shadow-card p-6">
        <p className="text-sm text-muted-foreground">
          Your child's attendance, marks, and assignments will be available here once linked by the school administrator.
        </p>
      </div>
    </div>
  );
}
