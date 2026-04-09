import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard, EmptyState } from '@/components/DashboardWidgets';
import { Calendar, Award, Bell, FileText, ChevronRight, Heart, Sparkles, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { NoticeBoard } from '@/components/NoticeBoard';

export default function ParentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/parent').then(({ data }) => {
      setStats(data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'Parent';

  return (
    <div className="stagger space-y-10">
      {/* Parent Welcome Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-500 via-rose-600 to-indigo-900 p-10 md:p-14 shadow-2xl text-white group">
        <div className="absolute top-0 right-0 -m-12 h-96 w-96 rounded-full bg-white/10 blur-3xl opacity-40 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-1/4 left-1/4 -m-12 h-48 w-48 rounded-full bg-rose-400/20 blur-2xl opacity-30" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-6 border border-white/30">
              <Heart size={14} className="text-rose-200 fill-rose-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Family Node Active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-none italic">
               Warm Welcome, <br />
               <span className="text-rose-100 not-italic">{firstName}! ✨</span>
            </h1>
            <p className="text-lg text-rose-50/70 font-bold mb-8 leading-relaxed">
              Stay connected with your child's growth. Monitor real-time attendance, performance metrics, and school updates from one centralized portal.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
               <button onClick={() => navigate('/dashboard/child-marks')} className="px-8 h-14 bg-white text-rose-600 font-black rounded-2xl shadow-xl hover:shadow-glow hover:scale-105 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 View Reports <Award size={18} />
               </button>
               <button onClick={() => navigate('/dashboard/complaints')} className="px-8 h-14 bg-rose-500/30 backdrop-blur-md text-white font-black rounded-2xl border border-white/20 hover:bg-white/10 transition-all text-sm uppercase tracking-widest flex items-center gap-2">
                 Support Liaison <ShieldCheck size={18} />
               </button>
            </div>
          </div>
          
          <div className="hidden lg:block relative group-hover:rotate-3 transition-transform duration-700">
             <div className="h-64 w-64 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[4rem] rotate-12 flex items-center justify-center p-12 shadow-2xl relative">
                <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-75" />
                <User size={120} className="text-white drop-shadow-[0_10px_20px_rgba(255,255,255,0.4)] animate-float" />
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Family Data...</p>
        </div>
      ) : !stats ? (
        <EmptyState icon={<ShieldCheck size={40} />} title="Family Link Pending" description="No student profile is currently linked to your node. Please contact the administration office for synchronization." />
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Live Attendance" value={stats.attendanceRate} icon={<Calendar />} color="indigo" trend="Current Term" />
            <StatCard label="Subject Peak" value={stats.latestMark} icon={<Award />} color="rose" subtitle="Recent evaluation" />
            <StatCard label="Global Notices" value={stats.noticeCount} icon={<Bell />} color="amber" trend="Check board" />
            <StatCard label="Term Lessons" value={stats.assignmentCount} icon={<FileText />} color="green" subtitle="Academic resources" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card-premium p-10 bg-white border-none shadow-xl group">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <div className="p-3 bg-indigo-50 text-primary rounded-2xl shadow-sm"><Sparkles size={24} /></div>
                     Direct Access Pathways
                  </h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Link to="/dashboard/child-attendance" className="p-6 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-[2rem] transition-all group/card flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform"><Calendar size={20} /></div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Attendance Logs</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                 </Link>
                 <Link to="/dashboard/child-marks" className="p-6 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-[2rem] transition-all group/card flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white text-rose-500 flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform"><Award size={20} /></div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Mark Reports</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                 </Link>
                 <Link to="/dashboard/notices" className="p-6 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 rounded-[2rem] transition-all group/card flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform"><Bell size={20} /></div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Notice Feed</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                 </Link>
                 <Link to="/dashboard/child-assignments" className="p-6 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-[2rem] transition-all group/card flex flex-col gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white text-emerald-500 flex items-center justify-center shadow-sm group-hover/card:scale-110 transition-transform"><FileText size={20} /></div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Module Vault</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover/card:translate-x-1 transition-transform" />
                    </div>
                 </Link>
               </div>
            </div>

            <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden flex flex-col justify-between">
               <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
               <div>
                  <h4 className="text-xl font-black mb-4">Support Direct</h4>
                  <p className="text-sm text-indigo-100/60 leading-relaxed font-medium mb-8">
                     Have a concern about your child's academic experience? Connect directly with the school administration liaison.
                  </p>
               </div>
               <button onClick={() => navigate('/dashboard/complaints')} className="w-full h-14 rounded-2xl bg-white/10 border border-white/20 text-white font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  Open Signal <ShieldCheck size={18} />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Latest Notices Section */}
      <div className="space-y-6 pt-10 border-t border-slate-100">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
            <Bell size={20} className="text-amber-500" /> Administrative Signals
          </h2>
          <button onClick={() => navigate('/dashboard/notices')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:underline decoration-2 group">
            All Notices <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <NoticeBoard limit={3} />
        </div>
      </div>
    </div>
  );
}
