import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { Users, BookOpen, ClipboardList, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      const [students, teachers, classes, subjects] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'teacher'),
        supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id),
        supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id),
      ]);
      setStats({
        students: students.count || 0,
        teachers: teachers.count || 0,
        classes: classes.count || 0,
        subjects: subjects.count || 0,
      });
    };
    fetchStats();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="School overview and quick actions." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} />
        <StatCard label="Total Teachers" value={stats.teachers} />
        <StatCard label="Classes" value={stats.classes} />
        <StatCard label="Subjects" value={stats.subjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card p-6">
          <h3 className="text-sm font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction icon={<Users className="h-4 w-4" strokeWidth={1.5} />} label="Add Teacher" href="/dashboard/teachers" />
            <QuickAction icon={<Users className="h-4 w-4" strokeWidth={1.5} />} label="Add Student" href="/dashboard/students" />
            <QuickAction icon={<BookOpen className="h-4 w-4" strokeWidth={1.5} />} label="Create Class" href="/dashboard/classes" />
            <QuickAction icon={<ClipboardList className="h-4 w-4" strokeWidth={1.5} />} label="Add Subject" href="/dashboard/subjects" />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6">
          <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Activity log will populate as users interact with the system.</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm"
    >
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span>{label}</span>
    </a>
  );
}
