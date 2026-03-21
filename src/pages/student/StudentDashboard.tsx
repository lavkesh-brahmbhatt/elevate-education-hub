import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ classes: 0, assignments: 0, attendance: '—' });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/student');
        setStats({
          classes: data.classes || 0,
          assignments: data.assignments || 0,
          attendance: data.attendance || '—'
        });
      } catch (err) {
        console.error('Error fetching student stats:', err);
      }
    };
    fetchStats();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Your academic overview." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Enrolled Classes" value={stats.classes} />
        <StatCard label="Assignments" value={stats.assignments} />
        <StatCard label="Attendance Rate" value={stats.attendance} />
      </div>
    </div>
  );
}
