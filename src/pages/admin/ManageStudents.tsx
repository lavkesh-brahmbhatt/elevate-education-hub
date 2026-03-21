import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users, Trash2 } from 'lucide-react';

type Profile = { _id: string; name: string; email: string; rollNumber: string; className: string; createdAt: string };

export default function ManageStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const [studentRes, classRes] = await Promise.all([
        api.get('/students'),
        api.get('/classes')
      ]);
      setStudents(studentRes.data || []);
      setClasses(classRes.data || []);
    } catch (err) {
      console.error('Data fetch error:', err);
      toast.error('Failed to load students or classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    if (classes.length === 0) {
      toast.error('Please create at least one class first (Classes menu)');
      return;
    }

    setCreating(true);
    try {
      await api.post('/students', {
        name: form.name,
        email: form.email,
        password: form.password,
        rollNumber: `R-${Math.floor(Math.random() * 900) + 100}`,
        classId: classes[0]._id, // Automatically use the first class found
        age: 15
      });
      toast.success('Student added successfully');
      setDialogOpen(false);
      setForm({ name: '', email: '', password: '' });
      fetchData();
    } catch (err: any) {
      console.error("Student create error:", err.response?.data || err.message);
      toast.error('Failed to create student: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student and their login account?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete student');
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Students"
        description="Manage student records at your school."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Student</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-text">Full Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Add Student'}
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
      ) : students.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No students yet" description="Add your first student to get started." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text py-3 px-4">Name</th>
                <th className="label-text py-3 px-4">Email</th>
                <th className="label-text py-3 px-4">Joined</th>
                <th className="label-text py-3 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{s.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground tabular-nums">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
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
