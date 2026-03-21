import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Award } from 'lucide-react';

type Mark = { examType: string; marksObtained: number; maxMarks: number; subjectId: any };

export default function StudentMarks() {
  const { profile } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    api.get('/marks').then(({ data }) => {
      setMarks((data as Mark[]) || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Marks" description="View your exam results." />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : marks.length === 0 ? (
        <EmptyState 
            icon={<Award className="h-6 w-6" />} 
            title="No marks yet" 
            description="Your exam results will appear here once your teachers record them." 
        />
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
                <tr key={i} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
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
