import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Award } from 'lucide-react';

type Mark = { exam_name: string; marks_obtained: number; total_marks: number; subject_id: string };
type Subject = { id: string; name: string };

export default function StudentMarks() {
  const { profile } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [mRes, sRes] = await Promise.all([
        supabase.from('marks').select('exam_name, marks_obtained, total_marks, subject_id').eq('student_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('subjects').select('id, name').eq('school_id', profile.school_id),
      ]);
      setMarks((mRes.data as Mark[]) || []);
      setSubjects((sRes.data as Subject[]) || []);
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || '';

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Marks" description="View your exam results." />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : marks.length === 0 ? (
        <EmptyState icon={<Award className="h-6 w-6" />} title="No marks yet" description="Your marks will appear here once recorded." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-border">
              <th className="label-text py-3 px-4">Exam</th>
              <th className="label-text py-3 px-4">Subject</th>
              <th className="label-text py-3 px-4 text-right">Score</th>
            </tr></thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-sm font-medium">{m.exam_name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{getSubjectName(m.subject_id)}</td>
                  <td className="py-3 px-4 text-sm text-right tabular-nums font-medium">{m.marks_obtained}/{m.total_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
