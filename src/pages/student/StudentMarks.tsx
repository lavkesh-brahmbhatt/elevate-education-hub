import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState, StatCard } from '@/components/DashboardWidgets';
import { Award, TrendingUp, CheckCircle, XCircle, Star, Target, PieChart, ShieldCheck } from 'lucide-react';

type Mark = { _id: string; examType: string; marksObtained: number; maxMarks: number; subjectId: any };

export default function StudentMarks() {
  const { profile } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    api.get('/marks').then(({ data }) => {
      setMarks((data as Mark[]) || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [profile]);

  const avgPercentage = marks.length > 0
    ? (marks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / marks.length).toFixed(0)
    : '0';
  const passed = marks.filter(m => (m.marksObtained / m.maxMarks) >= 0.4).length;

  return (
    <div className="stagger">
      <PageHeader 
        title="Academic Transcript" 
        description="Comprehensive review of your examination scores and performance metrics across current curricula." 
        icon={<Award size={28} />}
      />

      {marks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <StatCard label="Examinations" value={marks.length} icon={<Target />} color="indigo" trend="Term Cycle" />
          <StatCard label="Composite Avg" value={`${avgPercentage}%`} icon={<TrendingUp />} color="emerald" trend="Maintain Level" />
          <StatCard label="Success Ratio" value={`${passed} / ${marks.length}`} icon={<CheckCircle />} color="amber" subtitle="Passed assessments" />
          <StatCard label="Current Standing" value="Good" icon={<Star />} color="rose" trend="Verified" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Compiling Results...</p>
        </div>
      ) : marks.length === 0 ? (
        <EmptyState
          icon={<PieChart className="h-10 w-10 text-slate-300" />}
          title="Transcript Empty"
          description="Your examination scores will be synchronized here once your faculty leads finalize grading."
        />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Subject Field</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Assessment Type</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Raw Output</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Performance %</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-center">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {marks.map((m, idx) => {
                  const pct = ((m.marksObtained / m.maxMarks) * 100).toFixed(0);
                  const isPassed = m.marksObtained / m.maxMarks >= 0.4;
                  return (
                    <tr key={m._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                           <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-slate-100">
                              {(m.subjectId?.name || 'N/A').charAt(0)}
                           </div>
                           <p className="text-sm font-black text-slate-800">{m.subjectId?.name || 'Unknown Unit'}</p>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                          {m.examType}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                           <span className="text-base font-black text-slate-800">{m.marksObtained}</span>
                           <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">/ {m.maxMarks}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right tabular-nums">
                        <span className={`text-xl font-black ${Number(pct) >= 75 ? 'text-emerald-500' : (Number(pct) >= 40 ? 'text-indigo-500' : 'text-rose-500')}`}>{pct}%</span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center justify-center">
                          {isPassed
                            ? <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck size={14} className="fill-emerald-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Mastered</span>
                              </div>
                            : <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                <XCircle size={14} className="fill-rose-100" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Below Par</span>
                              </div>
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
