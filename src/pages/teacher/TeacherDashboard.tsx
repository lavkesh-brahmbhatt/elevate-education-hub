import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { Users, BookCheck, ClipboardList, Sparkles, GraduationCap, ArrowRight, UserPlus, FileUp, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NoticeBoard } from '@/components/NoticeBoard';

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ classes: 0, subjects: 0, assignments: 0 });

  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats/teacher');
        setStats({
          classes: data.classes || 0,
          subjects: data.subjects || 0,
          assignments: data.assignments || 0
        });
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      }
    };
    fetchStats();
  }, [profile]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Teacher';

  return (
    <div className="stagger space-y-10">
      {/* Faculty Hero Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-10 md:p-14 shadow-2xl text-white group">
        <div className="absolute top-0 right-0 -m-12 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl opacity-40 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 -m-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Educator Portal Active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none">
               Command Center, <br />
               <span className="text-primary italic">Professor {firstName}</span>
            </h1>
            <p className="text-lg text-slate-400 font-bold mb-8 leading-relaxed">
              Empower your students with knowledge. You're currently managing {stats.classes} active classrooms and {stats.subjects} academic subjects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <button onClick={() => navigate('/dashboard/attendance')} className="px-8 h-14 bg-primary text-white font-black rounded-2xl shadow-primary hover:shadow-glow hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 Take Roll Call <UserPlus size={18} />
               </button>
               <button onClick={() => navigate('/dashboard/assignments')} className="px-8 h-14 bg-white/5 backdrop-blur-md text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 Post Assignment <FileUp size={18} />
               </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative group-hover:-rotate-6 transition-transform duration-700">
             <div className="h-64 w-64 bg-primary/10 backdrop-blur-xl border border-white/5 rounded-[3.5rem] -rotate-12 flex items-center justify-center p-10 shadow-2xl relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-50" />
                <BookCheck size={120} className="text-primary drop-shadow-[0_10px_20px_rgba(var(--primary-rgb),0.5)] animate-float" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <StatCard label="Managed Classes" value={stats.classes} icon={<GraduationCap />} color="indigo" trend="Full Load" />
        <StatCard label="Course Subjects" value={stats.subjects} icon={<BookCheck />} color="green" subtitle="Department Lead" />
        <StatCard label="Live Assignments" value={stats.assignments} icon={<ClipboardList />} color="amber" trend="Evaluations Pending" />
      </div>

      {/* Faculty Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="card-premium p-8 bg-white border-none group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate('/dashboard/marks')}>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <BookCheck size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Academic Grading</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Finalize term results</p>
            <p className="text-[13px] font-medium text-slate-500 leading-relaxed group-hover:text-slate-800 transition-colors">Digital gradebook for all your assigned subjects across various grade levels.</p>
         </div>

         <div className="card-premium p-8 bg-white border-none group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate('/dashboard/materials')}>
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <FileUp size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Research Assets</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Study material vault</p>
            <p className="text-[13px] font-medium text-slate-500 leading-relaxed group-hover:text-slate-800 transition-colors">Publish PDFs, lecture slides, and supplementary reading for student nodes.</p>
         </div>

         <div className="card-premium p-8 bg-white border-none group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate('/dashboard/notices')}>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <Sparkles size={24} />
            </div>
            <h4 className="text-xl font-black text-slate-800 mb-2">Class Feed</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Departmental updates</p>
            <p className="text-[13px] font-medium text-slate-500 leading-relaxed group-hover:text-slate-800 transition-colors">Stay synchronized with school management and post internal class announcements.</p>
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
