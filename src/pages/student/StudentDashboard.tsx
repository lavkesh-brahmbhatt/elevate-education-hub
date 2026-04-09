import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { BookOpen, FileText, Calendar, Sparkles, GraduationCap, Target, ArrowRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NoticeBoard } from '@/components/NoticeBoard';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ classes: 0, assignments: 0, attendance: '—' });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/student');
        setStats({
          classes: data.classes || 0,
          assignments: data.assignments || 0,
          attendance: data.attendance || '—'
        });
      } catch (err) {
        console.error('Error fetching student stats:', err);
      }
    };
    fetchStats();
  }, [profile]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="stagger space-y-8">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-10 md:p-14 shadow-2xl text-white group">
        <div className="absolute top-0 right-0 -m-12 h-80 w-80 rounded-full bg-white/10 blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/30 animate-pulse-soft">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Node Active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none italic">
               Keep Rushing, <br />
               <span className="text-indigo-200 not-italic">{firstName}! 🚀</span>
            </h1>
            <p className="text-lg text-indigo-100/70 font-bold mb-8 leading-relaxed">
              Your academic journey is evolving. You have {stats.assignments} pending assignments to conquer today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <button onClick={() => navigate('/dashboard/my-assignments')} className="px-8 h-14 bg-white text-primary font-black rounded-2xl shadow-xl hover:shadow-glow hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 Submit Task <ArrowRight size={18} />
               </button>
               <button onClick={() => navigate('/dashboard/materials')} className="px-8 h-14 bg-indigo-500/30 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 hover:bg-white/10 transition-all text-sm uppercase tracking-widest">
                 Study Lab
               </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative group-hover:rotate-6 transition-transform duration-700">
             <div className="h-56 w-56 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] rotate-12 flex items-center justify-center p-8 shadow-2xl">
                <GraduationCap size={100} className="text-white drop-shadow-[0_10px_20px_rgba(255,255,255,0.3)] animate-float" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard label="Enrolled Units" value={stats.classes} icon={<BookOpen />} color="indigo" trend="Active Cycle" />
        <StatCard label="Assignments" value={stats.assignments} icon={<FileText />} color="amber" subtitle="Check deadlines" />
        <StatCard label="Attendance" value={stats.attendance} icon={<Target />} color="green" trend="Target 95%" />
      </div>

      {/* Mini Schedule / Action Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="card-premium p-8 bg-white border-none shadow-xl flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Academic Roadmap</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">Review your schedule and attendance consistency to stay on top of your performance targets.</p>
            </div>
            <button onClick={() => navigate('/dashboard/my-attendance')} className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline decoration-2">
              View Analytics <ArrowRight size={14} />
            </button>
         </div>

         <div className="card-premium p-8 bg-slate-900 text-white border-none shadow-xl flex flex-col justify-between group overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-[2] pointer-events-none group-hover:rotate-12 transition-transform duration-500"><FileText size={100} /></div>
            <div>
              <div className="h-12 w-12 rounded-2xl bg-white/10 text-indigo-300 flex items-center justify-center mb-6 shadow-glow border border-white/10">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Subject Vault</h3>
              <p className="text-sm font-medium text-indigo-100/60 leading-relaxed mb-6">Deep dive into your class materials and lecture notes uploaded by your core faculty leads.</p>
            </div>
            <button onClick={() => navigate('/dashboard/my-classes')} className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-colors">
              Access Courseware <ArrowRight size={14} />
            </button>
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
