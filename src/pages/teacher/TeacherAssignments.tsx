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
import { Plus, FileText } from 'lucide-react';

type Assignment = { id: string; title: string; description: string | null; due_date: string | null; class_id: string; created_at: string };
type ClassItem = { id: string; name: string; section: string | null };

export default function TeacherAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', due_date: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      const [aRes, sRes] = await Promise.all([
        supabase.from('assignments').select('*').eq('created_by', profile.id).order('created_at', { ascending: false }),
        supabase.from('subjects').select('class_id').eq('teacher_id', profile.id),
      ]);
      setAssignments((aRes.data as Assignment[]) || []);
      const classIds = [...new Set((sRes.data || []).map(s => s.class_id))];
      if (classIds.length > 0) {
        const { data } = await supabase.from('classes').select('id, name, section').in('id', classIds);
        setClasses((data as ClassItem[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('assignments').insert({
        school_id: profile.school_id,
        class_id: form.class_id,
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        created_by: profile.id,
      });
      if (error) throw error;
      toast.success('Assignment created');
      setDialogOpen(false);
      setForm({ title: '', description: '', class_id: '', due_date: '' });
      const { data } = await supabase.from('assignments').select('*').eq('created_by', profile.id).order('created_at', { ascending: false });
      setAssignments((data as Assignment[]) || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const getClassName = (id: string) => {
    const c = classes.find(cl => cl.id === id);
    return c ? `${c.name}${c.section ? ` (${c.section})` : ''}` : '';
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assignments"
        description="Create and manage assignments for your classes."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Create Assignment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-text">Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Class</Label>
                  <Select value={form.class_id} onValueChange={v => setForm(f => ({ ...f, class_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Due Date</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <Button type="submit" className="w-full" disabled={creating || !form.class_id}>
                  {creating ? 'Creating...' : 'Create Assignment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="No assignments yet" description="Create your first assignment." />
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="bg-card rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{getClassName(a.class_id)}</p>
                  {a.description && <p className="text-sm text-muted-foreground mt-2">{a.description}</p>}
                </div>
                {a.due_date && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    Due: {new Date(a.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
