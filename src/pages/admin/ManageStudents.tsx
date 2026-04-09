import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Users, Trash2, Edit2, UserPlus, Mail, Phone, Calendar as CalendarIcon, Hash, UserCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Profile = { _id: string; name: string; email: string; rollNumber: string; classId?: any; createdAt: string };

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
      toast.error('Please create at least one class first');
      return;
    }

    if (!form.classId) {
      toast.error('Please select a class');
      return;
    }

    setCreating(true);
    try {
      await api.post('/students', {
        ...form,
        rollNumber: `R-${Math.floor(Math.random() * 900) + 100}`,
        age: parseInt(form.age) || 15
      });

      toast.success('Student added successfully');
      setDialogOpen(false);
      setForm({ name: '', email: '', password: '', classId: '', age: '' });
      fetchData();
    } catch (err: any) {
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
      toast.error('Failed to link parent');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Student Directory"
        description="View and manage student enrollments, academic records, and parent links."
        icon={<Users size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> New Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white">
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black text-white">Enroll New Student</DialogTitle>
                   <p className="text-indigo-100/70 text-sm font-medium">Enter details to create student credentials and profile.</p>
                 </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Full Name</Label>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="Enter student's full name"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Class</Label>
                    <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Age</Label>
                    <Input 
                      type="number" min="5" max="25"
                      value={form.age} 
                      onChange={e => setForm(f => ({ ...f, age: e.target.value }))} 
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="e.g. 15"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Email Address</Label>
                  <Input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="student@school.com"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Password</Label>
                  <Input 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="••••••••"
                    required minLength={6} 
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase tracking-[0.1em] shadow-lg shadow-primary/20 hover:shadow-glow transition-all active:scale-95 mt-4" disabled={creating}>
                  {creating ? 'Creating Account...' : 'Confirm Enrollment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog - Premium Redesign */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-warm p-8 text-white">
            <DialogHeader><DialogTitle className="text-2xl font-black text-white">Update Student Profile</DialogTitle></DialogHeader>
          </div>
          <form onSubmit={handleEdit} className="p-8 space-y-6 bg-white">
            <div className="space-y-2 group">
              <Label className="label-text group-focus-within:text-primary">Full Name</Label>
              <Input 
                value={editTarget?.name || ''} 
                onChange={e => setEditTarget(prev => prev ? { ...prev, name: e.target.value } : null)} 
                className="h-12 rounded-xl border-slate-200"
                required 
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-warm text-white font-black uppercase shadow-lg shadow-accent/20" disabled={creating}>
              {creating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Parent Linking Dialog - Premium Redesign */}
      <Dialog open={parentDialogOpen} onOpenChange={setParentDialogOpen}>
        <DialogContent className="rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-900 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus size={100}/></div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-white">Link Guardian Account</DialogTitle>
              <p className="text-indigo-200 text-sm font-medium">Link a parent to {parentTarget?.name}</p>
            </DialogHeader>
          </div>
          <form onSubmit={handleLinkParent} className="p-8 space-y-5 bg-white">
            <div className="space-y-1.5 group">
              <Label className="label-text">Guardian's Full Name</Label>
              <Input value={parentForm.name} onChange={e => setParentForm(f => ({ ...f, name: e.target.value }))} className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-1.5 group">
              <Label className="label-text">Contact Email</Label>
              <Input type="email" value={parentForm.email} onChange={e => setParentForm(f => ({ ...f, email: e.target.value }))} className="h-12 rounded-xl" required />
            </div>
            <div className="space-y-1.5 group">
              <Label className="label-text">Phone Number</Label>
              <Input type="tel" value={parentForm.phone} onChange={e => setParentForm(f => ({ ...f, phone: e.target.value }))} className="h-12 rounded-xl" required />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-indigo-900 text-white font-black uppercase mt-4" disabled={creating}>
              {creating ? 'Linking...' : 'Create Guardian Login'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Directory...</p>
        </div>
      ) : students.length === 0 ? (
        <EmptyState icon={<Users className="h-10 w-10" />} title="No students found" description="The student directory is empty. Enroll your first student to get started." />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Student Profile</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Academic ID</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Enrollment Date</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s, idx) => {
                  const colors = ['bg-indigo-100 text-indigo-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <tr key={s._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl ${colorClass} flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{s.name}</p>
                            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5"><Mail size={12}/>{s.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                           <Hash size={12} className="text-slate-400" /> {s.rollNumber || 'TBD'}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold tabular-nums">
                          <CalendarIcon size={14} className="text-slate-300" />
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                          <Button
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-indigo-50 text-primary"
                            onClick={() => { setEditTarget(s); setEditOpen(true); }}
                            title="Edit Student"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-50 text-emerald-600"
                            onClick={() => { setParentTarget(s); setParentDialogOpen(true); }}
                            title="Link Parent"
                          >
                            <UserPlus size={16} strokeWidth={2.5} />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-600" 
                            onClick={() => handleDelete(s._id)}
                            title="Delete Student"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
