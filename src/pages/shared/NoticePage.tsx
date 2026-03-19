
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Bell, Plus, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

type Notice = {
  id: string;
  title: string;
  description: string;
  category: 'event' | 'update' | 'alert';
  created_at: string;
};

export default function NoticePage() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'update' as const });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'global_admin';

  const fetchNotices = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });
    setNotices((data as Notice[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('notices').insert({
        school_id: profile.school_id,
        title: form.title,
        description: form.description,
        category: form.category,
        created_by: profile.id === 'global-admin' ? profile.id : profile.id, // Handle global admin mock
      });
      if (error) throw error;
      toast.success('Notice posted successfully');
      setDialogOpen(false);
      setForm({ title: '', description: '', category: 'update' });
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      toast.success('Notice deleted');
      fetchNotices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notice Board"
        description="Stay updated with the latest news, events, and alerts."
        action={isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Post Notice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post New Notice</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Annual Sports Day" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(val: any) => setForm(f => ({ ...f, category: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">General Update</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="alert">Alert / Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Details about the notice..." rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Posting...' : 'Post Notice'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : notices.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notices yet" description="Check back later for school updates." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-card rounded-xl shadow-card p-6 flex flex-col relative group">
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  onClick={() => handleDelete(notice.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
              <div className="mb-4">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full font-bold shadow-sm ${
                  notice.category === 'alert' ? 'bg-destructive/10 text-destructive' :
                  notice.category === 'event' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {notice.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{notice.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 flex-1 whitespace-pre-wrap leading-relaxed">
                {notice.description}
              </p>
              <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {new Date(notice.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
