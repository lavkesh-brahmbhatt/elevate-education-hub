import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ classes: 0, assignments: 0, attendance: '—' });

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [enrollments, attendance] = await Promise.all([
        supabase.from('enrollments').select('class_id').eq('student_id', profile.id),
        supabase.from('attendance').select('status').eq('student_id', profile.id),
      ]);
      const classIds = (enrollments.data || []).map(e => e.class_id);
      let assignmentCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase.from('assignments').select('id', { count: 'exact', head: true }).in('class_id', classIds);
        assignmentCount = count || 0;
      }
      const total = (attendance.data || []).length;
      const present = (attendance.data || []).filter(a => a.status === 'present').length;
      const rate = total > 0 ? `${Math.round((present / total) * 100)}%` : '—';

      setStats({ classes: classIds.length, assignments: assignmentCount, attendance: rate });
    };
    fetch();
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
