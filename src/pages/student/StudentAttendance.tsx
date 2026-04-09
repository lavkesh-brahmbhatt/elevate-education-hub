import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState, StatCard } from '@/components/DashboardWidgets';
import { Calendar, Check, X, Clock, AlertCircle, Smile, Frown, Percent, History, Star } from 'lucide-react';

type AttendanceRecord = { _id: string; date: string; status: string; classId: any };

export default function StudentAttendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    api.get('/attendance').then(({ data }) => {
      setRecords((data as AttendanceRecord[]) || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [profile]);

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const attendancePercentage = records.length > 0 ? ((presentCount + (lateCount * 0.5)) / records.length * 100).toFixed(0) : '0';

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'present': return { icon: <Check size={14} />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Present' };
      case 'absent': return { icon: <X size={14} />, bg: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Absent' };
      case 'late': return { icon: <Clock size={14} />, bg: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Late Arrival' };
      default: return { icon: <AlertCircle size={14} />, bg: 'bg-slate-50 text-slate-500 border-slate-100', label: 'Unknown' };
    }
  };

  return (
    <div className="stagger">
      <PageHeader 
        title="Attendance Insights" 
        description="Track your consistency and monitor your school attendance performance."
        icon={<Calendar size={28} />}
      />
      
      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Present" value={presentCount} icon={<Smile />} color="green" />
          <StatCard label="Days Absent" value={absentCount} icon={<Frown />} color="rose" />
          <StatCard label="Punctuality" value={lateCount} icon={<Clock />} color="amber" subtitle="Arrived after bell" />
          <StatCard label="Success Rate" value={`${attendancePercentage}%`} icon={<Star />} color="indigo" trend="Maintain > 90%" />
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Fetching Records...</p>
        </div>
      ) : records.length === 0 ? (
        <EmptyState icon={<History className="h-10 w-10" />} title="No data logged" description="Your attendance records will be synchronized here once your teacher marks them." />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Academic Date</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Status & Tag</th>
                  <th className="py-5 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => {
                  const s = getStatusStyle(r.status);
                  return (
                    <tr key={r._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors">
                              <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{new Date(r.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                              <span className="text-sm font-black text-slate-700 leading-none mt-0.5">{new Date(r.date).getDate()}</span>
                           </div>
                           <div>
                             <p className="text-sm font-bold text-slate-800 tabular-nums">
                               {new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}
                             </p>
                           </div>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${s.bg} text-xs font-black uppercase tracking-widest shadow-sm`}>
                          {s.icon}
                          {s.label}
                        </div>
                      </td>
                      <td className="py-5 px-8 text-xs font-medium text-slate-400 italic">
                        {r.status === 'present' ? 'Successfully marked by classroom teacher.' : (r.status === 'absent' ? 'System logged as unexcused absence.' : 'Late entry recorded.')}
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
