import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState, StatCard } from '@/components/DashboardWidgets';
import { Award, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

type Mark = { _id: string; examType: string; marksObtained: number; maxMarks: number; subjectId: any };

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

  const avgPercentage = marks.length > 0
    ? (marks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / marks.length).toFixed(1)
    : '0';
  const passed = marks.filter(m => (m.marksObtained / m.maxMarks) >= 0.4).length;

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Marks" description="View your academic exam results and performance." />

      {marks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Exams Taken" value={marks.length} icon={<Award className="h-4 w-4" />} />
          <StatCard label="Average Score" value={`${avgPercentage}%`} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Passed" value={`${passed} / ${marks.length}`} icon={<CheckCircle className="h-4 w-4" />} />
        </div>
      )}

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
              <tr className="border-b border-border bg-muted/20">
                <th className="label-text py-3.5 px-6 font-semibold">Subject</th>
                <th className="label-text py-3.5 px-6 font-semibold">Exam Type</th>
                <th className="label-text py-3.5 px-6 text-right font-semibold">Score</th>
                <th className="label-text py-3.5 px-6 text-right font-semibold">%</th>
                <th className="label-text py-3.5 px-6 text-center font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((m) => {
                const pct = ((m.marksObtained / m.maxMarks) * 100).toFixed(0);
                const passed = m.marksObtained / m.maxMarks >= 0.4;
                return (
                  <tr key={m._id} className="border-b border-border last:border-0 hover:bg-subtle/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium">{m.subjectId?.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground italic">{m.examType}</td>
                    <td className="py-4 px-6 text-sm text-right tabular-nums font-bold">
                      {m.marksObtained} <span className="text-muted-foreground font-normal">/ {m.maxMarks}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-right tabular-nums font-semibold text-primary">{pct}%</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {passed
                          ? <><CheckCircle className="h-4 w-4 text-success" /><span className="text-xs font-bold text-success uppercase">Pass</span></>
                          : <><XCircle className="h-4 w-4 text-destructive" /><span className="text-xs font-bold text-destructive uppercase">Fail</span></>
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
