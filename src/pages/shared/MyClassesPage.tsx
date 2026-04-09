import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { BookOpen, GraduationCap, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ClassItem = { _id: string; name: string; section: string | null; grade?: string };

export default function MyClassesPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/classes');
        setClasses((data as ClassItem[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [profile]);

  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="stagger">
      <PageHeader
        title={isTeacher ? 'Assigned Classrooms' : 'Academic Node'}
        description={isTeacher
          ? 'Monitor and manage the academic progress of your current teaching assignments.'
          : 'Detailed overview of your current class enrollment and academic section.'}
        icon={<GraduationCap size={28} />}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Node...</p>
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10 text-slate-300" />}
          title={isTeacher ? 'No classes assigned' : 'Not enrolled in a class'}
          description={isTeacher
            ? 'Contact the admin to be assigned to specific subjects and classrooms.'
            : 'Contact the admin to complete your classroom enrollment process.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((c, idx) => {
            const gradients = [
              'indigo', 'rose', 'emerald', 'amber', 'blue'
            ];
            const color = gradients[idx % gradients.length];
            return (
              <div key={c._id} className="card-premium p-10 bg-white/70 backdrop-blur-md border-none group hover:scale-[1.05] transition-all duration-500 overflow-hidden relative border-t-4 border-t-indigo-500">
                <div className={`absolute top-0 right-0 -m-8 h-32 w-32 bg-indigo-50/50 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-colors duration-500`} />
                
                <div className="flex items-center justify-between mb-8">
                   <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform duration-500">
                      <GraduationCap size={28} />
                   </div>
                   <div className="px-3 py-1 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 flex items-center gap-1.5 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                      <ShieldCheck size={12} /> Verified
                   </div>
                </div>

                <div className="space-y-2 mb-10">
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors">{c.name}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Users size={14} className="text-slate-300" />
                      {c.section ? `Section ${c.section}` : 'Full Academic Program'}
                   </p>
                </div>

                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Status</span>
                      <div className="flex items-center gap-2">
                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
                         <span className="text-xs font-bold text-slate-700">Operational</span>
                      </div>
                   </div>
                   <button 
                     onClick={() => navigate(isTeacher ? `/dashboard/teacher/attendance` : `/dashboard/student/attendance`)} 
                     className="h-10 w-10 flex items-center justify-center bg-slate-50 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                   >
                     <ArrowRight size={18} />
                   </button>
                </div>

                {idx === 0 && (
                   <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                      <Sparkles size={80} className="text-primary rotate-12" />
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
