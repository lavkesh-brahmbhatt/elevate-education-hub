import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, UserCheck, Mail, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { useTeachers, useCreateMutation, useDeleteMutation } from '@/hooks/useApi';
import api from '@/services/api';

type Profile = {
  _id: string;
  name: string;
  email: string | null;
  role: string;
  createdAt: string;
};

export default function ManageTeachers() {
  const { profile } = useAuth();
  const { data: teachers = [], isLoading: loading } = useTeachers();
  const createTeacher = useCreateMutation('/teachers', ['teachers']);
  const deleteTeacher = useDeleteMutation('/teachers', ['teachers']);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editTarget, setEditTarget] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await createTeacher.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        subjects: [],
        classes: []
      });
      toast.success('Teacher added successfully');
      setDialogOpen(false);
      setForm({ name: '', email: '', password: '' });
    } catch (err: any) {
      toast.error('Failed to create teacher');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      await api.put(`/teachers/${editTarget._id}`, { name: editTarget.name });
      toast.success('Teacher updated');
      setEditOpen(false);
    } catch (err) {
      toast.error('Failed to update teacher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher and their login account?')) return;
    try {
      await deleteTeacher.mutateAsync(id);
      toast.success('Teacher deleted');
    } catch (err) {
      toast.error('Failed to delete teacher');
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Faculty Management"
        description="Oversee and manage teaching staff assignments and professional profiles."
        icon={<UserCheck size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Onboard Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white">New Teacher Profile</DialogTitle>
                  <p className="text-indigo-100/70 text-sm font-medium">Create a new faculty account for your school.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Full Name</Label>
                  <Input 
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="e.g. Prof. Michael Scott"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Official Email</Label>
                  <Input 
                    type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="teacher@school.edu"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Default Password</Label>
                  <Input 
                    type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    className="h-12 rounded-xl border-slate-200"
                    placeholder="••••••••"
                    required minLength={6} 
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4 shadow-lg shadow-primary/20" disabled={createTeacher.isPending}>
                  {createTeacher.isPending ? 'Processing...' : 'Complete Onboarding'}
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
            <DialogHeader><DialogTitle className="text-2xl font-black text-white">Modify Staff Profile</DialogTitle></DialogHeader>
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
            <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-warm text-white font-black uppercase shadow-lg shadow-accent/20" disabled={saving}>
              {saving ? 'Saving...' : 'Update Records'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Faculty...</p>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState icon={<UserCheck className="h-10 w-10" />} title="No staff members" description="You haven't added any teachers yet. Start building your school's faculty." />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Staff Member</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Official Contact</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Registration</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teachers.map((t, idx) => {
                  const colors = ['bg-indigo-100 text-indigo-600', 'bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600', 'bg-sky-100 text-sky-600'];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <tr key={t._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-2xl ${colorClass} flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {t.name}
                              <ShieldCheck size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter">Verified Faculty</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-300" /> {t.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold tabular-nums">
                          <CalendarIcon size={14} className="text-slate-300" />
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                          <Button
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"
                            onClick={() => { setEditTarget(t); setEditOpen(true); }}
                            title="Edit Record"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </Button>
                          <Button 
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-600" 
                            onClick={() => handleDelete(t._id)}
                            title="Remove Faculty"
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
