import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Award } from 'lucide-react';

type Mark = { examType: string; marksObtained: number; maxMarks: number; subjectId: { name: string } };

export default function ParentChildMarks() {
  const { profile } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      try {
        const { data } = await api.get('/marks');
        setMarks((data as Mark[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Child's Progress" description="Academic performance report for your child." />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : marks.length === 0 ? (
        <EmptyState icon={<Award className="h-6 w-6" />} title="No results yet" description="Your child's results will appear here once recorded by teachers." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text py-3 px-4">Exam Type</th>
                <th className="label-text py-3 px-4">Subject</th>
                <th className="label-text py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-subtle/30 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{m.examType}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{m.subjectId?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-right tabular-nums font-semibold">
                    {m.marksObtained} <span className="text-muted-foreground font-normal">/ {m.maxMarks}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
