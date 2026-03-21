import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon } from 'lucide-react';

type Notice = {
  _id: string;
  title: string;
  description: string;
  category?: 'event' | 'update' | 'alert';
  date: string;
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
        // Sort and limit in frontend for simplicity if needed, 
        // but backend already sorts by date.
        setNotices((data as Notice[]).slice(0, limit) || []);
      } catch (err) {
        console.error('Error fetching notices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [profile, limit]);

  if (loading) return <div className="h-24 flex items-center justify-center"><div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {notices.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No recent notices.</p>
      ) : (
        notices.map((notice) => (
          <div key={notice._id} className="p-4 rounded-xl border border-border bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold">{notice.title}</h4>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                notice.category === 'alert' ? 'bg-destructive/10 text-destructive' :
                notice.category === 'event' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                {notice.category || 'update'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
              {notice.description}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {new Date(notice.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
