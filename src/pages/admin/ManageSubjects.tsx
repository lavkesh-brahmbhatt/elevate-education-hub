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
import { Plus, ClipboardList, Trash2 } from 'lucide-react';

type Subject = { _id: string; name: string; classId: any; teacherId: any; createdAt: string };
type ClassItem = { _id: string; name: string; section: string | null };
type Teacher = { _id: string; name: string };

export default function ManageSubjects() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', classId: '', teacherId: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [subRes, classRes, teachRes] = await Promise.all([
        api.get('/subjects'),
        // Admin role has no filter — gets all classes. STUDENT/TEACHER get filtered.
        // Do NOT add a case for ADMIN here. This is intentional.
        api.get('/classes'),
        api.get('/teachers'),
      ]);
      setSubjects(subRes.data || []);
      setClasses(classRes.data || []);
      setTeachers(teachRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      await api.post('/subjects', {
        name: form.name,
        classId: form.classId,
        teacherId: form.teacherId || null,
      });
      toast.success('Subject added');
      setDialogOpen(false);
      setForm({ name: '', classId: '', teacherId: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Subjects"
        description="Manage subjects and assign teachers."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Add Subject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-text">Subject Name</Label>
                  <Input placeholder="Mathematics" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Class</Label>
                  <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Assign Teacher</Label>
                  <Select value={form.teacherId} onValueChange={v => setForm(f => ({ ...f, teacherId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating || !form.classId}>
                  {creating ? 'Creating...' : 'Add Subject'}
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
      ) : subjects.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-6 w-6" />} title="No subjects yet" description="Add subjects and assign them to classes." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text py-3 px-4">Subject</th>
                <th className="label-text py-3 px-4">Class</th>
                <th className="label-text py-3 px-4">Teacher</th>
                <th className="label-text py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s._id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {s.classId?.name} {s.classId?.section ? `(${s.classId.section})` : ''}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{s.teacherId?.name || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
