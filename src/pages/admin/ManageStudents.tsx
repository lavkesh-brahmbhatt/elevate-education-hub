import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users, Trash2, Edit2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type Profile = { _id: string; name: string; email: string; rollNumber: string; className: string; createdAt: string };

export default function ManageStudents() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', classId: '', age: '' });
  const [creating, setCreating] = useState(false);
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [parentDialogOpen, setParentDialogOpen] = useState(false);
  const [parentTarget, setParentTarget] = useState<Profile | null>(null);
  const [parentForm, setParentForm] = useState({ name: '', email: '', phone: '' });


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

    if (!form.classId) {
      toast.error('Please select a class');
      return;
    }


    setCreating(true);
    try {
      await api.post('/students', {
        name: form.name,
        email: form.email,
        password: form.password,
        rollNumber: `R-${Math.floor(Math.random() * 900) + 100}`,
        classId: form.classId, // Now explicitly chosen by admin
        age: parseInt(form.age) || 15
      });

      toast.success('Student added successfully');
      setDialogOpen(false);
      setForm({ name: '', email: '', password: '', classId: '', age: '' });
      fetchData();
    } catch (err: any) {
      console.error("Student create error:", err.response?.data || err.message);
      toast.error('Failed to create student');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setCreating(true);
    try {
      await api.put(`/students/${editTarget._id}`, { name: editTarget.name });
      toast.success('Student updated');
      setEditOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update student');
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

  const handleLinkParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentTarget) return;
    setCreating(true);
    try {
      await api.post('/parents', { ...parentForm, studentId: parentTarget._id });
      toast.success(`Parent linked to ${parentTarget.name}`);
      setParentDialogOpen(false);
      setParentForm({ name: '', email: '', phone: '' });
    } catch (err: any) {
      toast.error('Failed to link parent: ' + (err.response?.data?.error || err.message));
    } finally {
      setCreating(false);
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
                <div className="space-y-2">
                  <Label className="label-text">Class</Label>
                  <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Age</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 14" 
                    min="5" max="25"
                    value={form.age} 
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))} 
                    required 
                  />
                </div>


                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Add Student'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label className="label-text">Full Name</Label>
              <Input 
                value={editTarget?.name || ''} 
                onChange={e => setEditTarget(prev => prev ? { ...prev, name: e.target.value } : null)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Parent Linking Dialog */}
      <Dialog open={parentDialogOpen} onOpenChange={setParentDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link Parent to {parentTarget?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleLinkParent} className="space-y-4">
            <div className="space-y-2">
              <Label className="label-text">Parent Full Name</Label>
              <Input value={parentForm.name} onChange={e => setParentForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="label-text">Parent Email</Label>
              <Input type="email" value={parentForm.email} onChange={e => setParentForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label className="label-text">Parent Phone</Label>
              <Input type="tel" value={parentForm.phone} onChange={e => setParentForm(f => ({ ...f, phone: e.target.value }))} required />
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Saving...' : 'Create Parent Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>


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
                <th className="label-text py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{s.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground tabular-nums">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setEditTarget(s); setEditOpen(true); }}
                      >
                        <Edit2 className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setParentTarget(s); setParentDialogOpen(true); }}
                        title="Link Parent"
                      >
                        <Plus className="h-4 w-4 text-primary" strokeWidth={1.5} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                      </Button>

                    </div>
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
