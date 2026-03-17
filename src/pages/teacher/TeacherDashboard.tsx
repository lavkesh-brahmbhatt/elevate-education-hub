import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ classes: 0, subjects: 0, assignments: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [subjects, assignments] = await Promise.all([
        supabase.from('subjects').select('id, class_id', { count: 'exact' }).eq('teacher_id', profile.id),
        supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('created_by', profile.id),
      ]);
      const uniqueClasses = new Set((subjects.data || []).map(s => s.class_id));
      setStats({ classes: uniqueClasses.size, subjects: subjects.count || 0, assignments: assignments.count || 0 });
    };
    fetch();
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
