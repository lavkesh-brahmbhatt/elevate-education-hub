import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { BookOpen } from 'lucide-react';

type ClassItem = { id: string; name: string; section: string | null; grade_level: string | null };

export default function MyClassesPage() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      if (profile.role === 'teacher') {
        const { data: subjects } = await supabase.from('subjects').select('class_id').eq('teacher_id', profile.id);
        const classIds = [...new Set((subjects || []).map(s => s.class_id))];
        if (classIds.length > 0) {
          const { data } = await supabase.from('classes').select('*').in('id', classIds);
          setClasses((data as ClassItem[]) || []);
        }
      } else {
        const { data: enrollments } = await supabase.from('enrollments').select('class_id').eq('student_id', profile.id);
        if (enrollments?.length) {
          const { data } = await supabase.from('classes').select('*').in('id', enrollments.map(e => e.class_id));
          setClasses((data as ClassItem[]) || []);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Classes" description={profile?.role === 'teacher' ? 'Classes you teach.' : 'Classes you are enrolled in.'} />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : classes.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No classes" description="You have no classes assigned yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className="bg-card rounded-xl shadow-card p-5">
              <h3 className="text-sm font-medium">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[c.section && `Section ${c.section}`, c.grade_level && `Grade ${c.grade_level}`].filter(Boolean).join(' · ') || 'No details'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
