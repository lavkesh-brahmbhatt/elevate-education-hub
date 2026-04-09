import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Notice = {
  _id: string;
  title: string;
  description: string;
  category?: 'event' | 'update' | 'alert';
  createdAt: string;
};

export function NoticeBoard({ limit = 5 }: { limit?: number }) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchNotices = async () => {
      try {
        const { data } = await api.get('/notices');
        setNotices((data as Notice[]).slice(0, limit) || []);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [profile, limit]);

  if (loading) return <div className="py-20 flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" /></div>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6"
    >
      {notices.length === 0 ? (
        <div className="py-20 text-center bg-white/40 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
           <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Zero Broadcast Signals</p>
        </div>
      ) : (
        notices.map((notice) => (
          <motion.div 
            key={notice._id} 
            variants={item}
            className="group card-premium p-8 bg-white/80 border-none shadow-xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-50 group-hover:bg-primary transition-colors" />
            
            <div className="flex items-center justify-between mb-6">
              <span className={`text-[9px] font-black uppercase tracking-[0.25em] px-3 py-1.5 rounded-xl ${
                notice.category === 'alert' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                notice.category === 'event' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                {notice.category || 'update'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 group-hover:text-slate-600 transition-colors uppercase tracking-widest tabular-nums">
                <CalendarIcon className="h-3.5 w-3.5" />
                {new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <h4 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-primary transition-colors">{notice.title}</h4>
            <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-6 leading-relaxed">
              {notice.description}
            </p>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic flex items-center gap-2">Official Communication <ArrowRight size={10} /></span>
               <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all"><ArrowRight size={14} /></div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
