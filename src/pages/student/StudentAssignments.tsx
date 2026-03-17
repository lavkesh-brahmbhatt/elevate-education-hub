import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { FileText } from 'lucide-react';

type Assignment = { id: string; title: string; description: string | null; due_date: string | null; created_at: string };

export default function StudentAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const { data: enrollments } = await supabase.from('enrollments').select('class_id').eq('student_id', profile.id);
      if (!enrollments?.length) { setLoading(false); return; }
      const classIds = enrollments.map(e => e.class_id);
      const { data } = await supabase.from('assignments').select('*').in('class_id', classIds).order('created_at', { ascending: false });
      setAssignments((data as Assignment[]) || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Assignments" description="View assignments from your classes." />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="No assignments" description="You have no assignments yet." />
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="bg-card rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium">{a.title}</h3>
                  {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                </div>
                {a.due_date && <span className="text-xs text-muted-foreground tabular-nums">Due: {new Date(a.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
