import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Calendar } from 'lucide-react';

type Assignment = { _id: string; title: string; dueDate: string; classId: any; subjectId: any };
type ClassItem = { _id: string; name: string };
type Subject = { _id: string; name: string; classId: string };

export default function TeacherAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [assRes, classRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setAssignments(assRes.data || []);
      setClasses(classRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      // Find teacher ID from profile if needed (the backend might already look it up)
      await api.post('/assignments', {
        ...form,
        teacherId: profile.id
      });
      toast.success('Assignment created');
      setDialogOpen(false);
      setForm({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });
      fetchAll();
    } catch (err: any) {
      toast.error('Failed to create: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assignments"
        description="Create and manage student assignments."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />New Assignment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                            <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Select value={form.subjectId} onValueChange={v => setForm(f => ({ ...f, subjectId: v }))}>
                            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>{subjects.filter(s => (typeof s.classId === 'string' ? s.classId : (s as any).classId?._id) === form.classId).map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Assignment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="No assignments" description="Create your first assignment to share with students." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(a => (
            <div key={a._id} className="bg-card rounded-xl shadow-card p-5 group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <h3 className="font-semibold mb-1">{a.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {a.subjectId?.name} · {a.classId?.name}{a.classId?.section ? ` (${a.classId.section})` : ''}
              </p>
              <div className="flex items-center gap-2 text-xs text-warning font-medium">
                <Calendar className="h-3.5 w-3.5" />
                Due {new Date(a.dueDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
