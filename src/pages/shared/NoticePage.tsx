import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Plus, Calendar as CalendarIcon, Trash2, Megaphone, Sparkles, AlertTriangle, Info } from 'lucide-react';

type Notice = {
  _id: string;
  title: string;
  description: string;
  category?: 'event' | 'update' | 'alert';
  createdAt: string;
};

export default function NoticePage() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'update' as const });

  const isAdmin = profile?.role === 'admin';

  const fetchNotices = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data } = await api.get('/notices');
      setNotices((data as Notice[]) || []);
    } catch (err) {
      console.error('Fetch notices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      await api.post('/notices', {
        title: form.title,
        description: form.description,
        category: form.category,
      });
      toast.success('Announcement broadcasted successfully');
      setDialogOpen(false);
      setForm({ title: '', description: '', category: 'update' });
      fetchNotices();
    } catch (err: any) {
      toast.error('Failed to post announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Notice removed');
      fetchNotices();
    } catch (err: any) {
      toast.error('Failed to delete notice');
    }
  };

  const getCategoryStyles = (cat?: string) => {
    switch (cat) {
      case 'alert': return { bg: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-200/20', icon: <AlertTriangle size={14} />, label: 'Urgent Alert' };
      case 'event': return { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-200/20', icon: <Sparkles size={14} />, label: 'School Event' };
      default: return { bg: 'bg-sky-50 text-sky-600 border-sky-100 shadow-sky-200/20', icon: <Info size={14} />, label: 'General Update' };
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Notice Board"
        description="Official announcements and upcoming events from the school administration."
        icon={<Megaphone size={28} />}
        action={isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Post Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Bell size={100}/></div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white">New Announcement</DialogTitle>
                  <p className="text-indigo-100/70 text-sm font-medium">Broadcast news to students, teachers, and parents.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Announcement Title</Label>
                  <Input 
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="e.g. Annual Sports Day 2026"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Category</Label>
                  <Select value={form.category} onValueChange={(val: any) => setForm(f => ({ ...f, category: val }))}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="update">General Update</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="alert">Alert / Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Content Description</Label>
                  <Textarea 
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                    className="rounded-xl border-slate-200 min-h-[120px] focus:ring-primary/10"
                    placeholder="Write the full details of your announcement here..."
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4" disabled={creating}>
                  {creating ? 'Broadcasting...' : 'Post Announcement'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Feed...</p>
        </div>
      ) : notices.length === 0 ? (
        <EmptyState icon={<Bell className="h-10 w-10" />} title="Broadcasting Quiet" description="No announcements have been posted yet. Check back later for updates." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notices.map((notice) => {
            const s = getCategoryStyles(notice.category);
            return (
              <div key={notice._id} className="card-premium p-8 bg-white/70 backdrop-blur-md border-none group hover:scale-[1.03] transition-all duration-500 flex flex-col relative overflow-hidden">
                {/* Visual Category Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${s.bg.split(' ')[0]} opacity-30`} />
                
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg"
                    onClick={() => handleDelete(notice._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
                
                <div className="mb-6 flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${s.bg} text-[10px] font-black uppercase tracking-[0.1em] shadow-sm`}>
                    {s.icon}
                    {s.label}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                     <CalendarIcon size={12} className="text-slate-300" />
                     {new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-primary transition-colors leading-tight">{notice.title}</h3>
                <p className="text-[13px] font-medium text-slate-500 mb-8 flex-1 whitespace-pre-wrap leading-relaxed">
                  {notice.description}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                   Official Communication · <span className="text-primary italic">Academy OS</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
