import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ classes: 0, subjects: 0, assignments: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/teacher');
        setStats({
          classes: data.classes || 0,
          subjects: data.subjects || 0,
          assignments: data.assignments || 0
        });
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
        // Fallback silence or toast
      }
    };
    fetchStats();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Your teaching overview." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="My Classes" value={stats.classes} />
        <StatCard label="My Subjects" value={stats.subjects} />
        <StatCard label="Assignments Created" value={stats.assignments} />
      </div>
    </div>
  );
}
