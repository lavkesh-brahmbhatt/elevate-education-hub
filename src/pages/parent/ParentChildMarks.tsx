import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Award } from 'lucide-react';

type Mark = { exam_name: string; marks_obtained: number; total_marks: number; subject_id: string };
type Subject = { id: string; name: string };

export default function ParentChildMarks() {
  const { profile } = useAuth();
  const [childName, setChildName] = useState('');
  const [marks, setMarks] = useState<Mark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      // Get linked student
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', profile.id)
        .limit(1);

      if (links && links.length > 0) {
        setChildName(links[0].profiles?.full_name || 'Child');
        const studentId = links[0].student_id;

        const [mRes, sRes] = await Promise.all([
          supabase.from('marks').select('exam_name, marks_obtained, total_marks, subject_id').eq('student_id', studentId).order('created_at', { ascending: false }),
          supabase.from('subjects').select('id, name').eq('school_id', profile.school_id),
        ]);
        setMarks((mRes.data as Mark[]) || []);
        setSubjects((sRes.data as Subject[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || '';

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${childName}'s Progress`} description={`Academic performance report for ${childName}.`} />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : !childName ? (
        <EmptyState icon={<Award className="h-6 w-6" />} title="No student linked" description="Please contact administrator to link your child." />
      ) : marks.length === 0 ? (
        <EmptyState icon={<Award className="h-6 w-6" />} title="No marks yet" description="Results will appear here once recorded by teachers." />
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
                <tr key={i} className="border-b border-border last:border-0 hover:bg-subtle/30 transition-colors">
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
