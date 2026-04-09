import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { Users, BookOpen, ClipboardList, PlusCircle, CheckCircle, Bell, History, ArrowRight, UserCheck, Sparkles, ShieldCheck, Activity, Target } from 'lucide-react';
import { NoticeBoard } from '@/components/NoticeBoard';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, classCount: 0, noticeCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/activity')
        ]);
        setStats(statsRes.data.stats);
        setActivities(activityRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';
  const sparklineData = [
    { value: 40 }, { value: 70 }, { value: 45 }, { value: 90 }, { value: 65 }, { value: 85 }, { value: 95 }
  ];

  return (
    <div className="space-y-10 stagger">
      {/* Institutional Command Center Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-10 md:p-14 shadow-2xl text-white group">
        <div className="absolute top-0 right-0 -m-16 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl opacity-40 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 -m-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Management Node: Synchronized</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none italic">
               Strategic Oversight, <br />
               <span className="text-primary not-italic">Admin {firstName}</span>
            </h1>
            <p className="text-lg text-slate-300 font-bold mb-8 leading-relaxed">
              Global operations are nominal. You are currently presiding over {stats.studentCount} student nodes and {stats.teacherCount} faculty leads across the institution.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <button onClick={() => navigate('/dashboard/notices')} className="px-8 h-14 bg-primary text-white font-black rounded-2xl shadow-primary hover:shadow-glow hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 Broadcast Signal <Bell size={18} />
               </button>
               <button onClick={() => navigate('/dashboard/analytics')} className="px-8 h-14 bg-white/5 backdrop-blur-md text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
                 Deep Analytics
               </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative group-hover:rotate-6 transition-transform duration-700">
             <div className="h-64 w-64 bg-primary/10 backdrop-blur-xl border border-white/5 rounded-[3.5rem] rotate-12 flex items-center justify-center p-10 shadow-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-50" />
                <GraduationCap size={120} className="text-white drop-shadow-[0_10px_20px_rgba(var(--primary-rgb),0.5)] animate-float" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Enrollment" value={stats.studentCount} icon={<Users />} color="indigo" trend="+4% Velocity" sparklineData={sparklineData} />
        <StatCard label="Faculty Corps" value={stats.teacherCount} icon={<UserCheck />} color="green" trend="Active Leads" sparklineData={sparklineData} />
        <StatCard label="Class Units" value={stats.classCount} icon={<BookOpen />} color="amber" subtitle="Deployment Nominal" sparklineData={sparklineData} />
        <StatCard label="Active Broadcasts" value={stats.noticeCount} icon={<Bell />} color="rose" trend="Check Board" sparklineData={sparklineData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
               <Activity size={20} className="text-primary" /> Core Gateways
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
             <QuickAction icon={<UserCheck />} label="Staff Registry" desc="Faculty lifecycle management" color="indigo" onClick={() => navigate('/dashboard/teachers')} />
             <QuickAction icon={<Users />} label="Student Matrix" desc="Enrollment & profile tracking" color="emerald" onClick={() => navigate('/dashboard/students')} />
             <QuickAction icon={<BookOpen />} label="Structural Units" desc="Classroom & section planning" color="amber" onClick={() => navigate('/dashboard/classes')} />
             <QuickAction icon={<ClipboardList />} label="Curricula Vault" desc="Academic subject definitions" color="rose" onClick={() => navigate('/dashboard/subjects')} />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
               <History size={20} className="text-slate-400" /> Operational Log
            </h3>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2">Full System Audit</button>
          </div>
          
          <div className="!bg-white/70 backdrop-blur-md border border-slate-100 rounded-[2.5rem] min-h-[450px] shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Activity size={200} /></div>
             
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                  <History size={40} />
                </div>
                <h4 className="text-slate-800 text-xl font-black mb-2">Zero Signals Found</h4>
                <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">Recent strategic actions and system deployments will synchronize here in real-time.</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {activities.map((a, idx) => (
                  <div key={idx} className="flex items-start gap-6 p-6 rounded-[1.5rem] hover:bg-white transition-all group border border-transparent hover:border-slate-100 hover:shadow-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all duration-300">
                      {a.action.includes('CREATED') ? <PlusCircle size={22} /> : <Target size={22} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-6 mb-2">
                        <p className="text-base font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">
                          {a.details}
                        </p>
                        <div className="flex flex-col items-end shrink-0">
                           <time className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                           </time>
                           <span className="text-[10px] font-bold text-slate-200 italic">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center text-[8px] font-black">
                               {a.performedBy?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">{a.performedBy}</span>
                         </div>
                         <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${a.action.includes('CREATED') ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-primary'}`}>
                            {a.action}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white to-transparent text-center">
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">Strategic Report Synchronization Active</button>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Notices Section */}
      <div className="space-y-6 pt-10 border-t border-slate-100">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
            <Bell size={20} className="text-amber-500" /> Latest Institutional Broadcasts
          </h3>
          <button onClick={() => navigate('/dashboard/notices')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline decoration-2 group">
            Global Board <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <NoticeBoard limit={3} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick, color }: { icon: any; label: string; desc: string; onClick: () => void; color: string }) {
  const colorMap: any = {
    indigo: 'bg-indigo-50/50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600',
    emerald: 'bg-emerald-50/50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600',
    amber: 'bg-amber-50/50 text-amber-600 border-amber-100 group-hover:bg-amber-600',
    rose: 'bg-rose-50/50 text-rose-600 border-rose-100 group-hover:bg-rose-600'
  };
  return (
    <button
      onClick={onClick}
      className="!bg-white/80 backdrop-blur-md p-6 flex items-center gap-6 w-full text-left group hover:scale-[1.02] transition-all duration-300 border border-slate-100 rounded-[2rem] shadow-xl"
    >
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${colorMap[color].split(' group-hover:')[0]} group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 group-hover:rotate-6 shadow-sm border`}>
        <div className="scale-125">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-base font-black text-slate-800 leading-none mb-1 group-hover:text-primary transition-colors">{label}</p>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
         <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </button>
  );
}

function GraduationCap(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
