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
import { Plus, ClipboardList, Trash2, Library, BookOpen, User, BookCheck } from 'lucide-react';

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
      setLoading(true);
      const [subRes, classRes, teachRes] = await Promise.all([
        api.get('/subjects'),
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
      toast.success('Subject added to curriculum');
      setDialogOpen(false);
      setForm({ name: '', classId: '', teacherId: '' });
      fetchData();
    } catch (err: any) {
      toast.error('Failed to add subject');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Academic Subjects"
        description="Define and assign academic subjects to classes and faculty members."
        icon={<Library size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><ClipboardList size={100}/></div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white">New Subject</DialogTitle>
                  <p className="text-indigo-100/70 text-sm font-medium">Add a new course to the school curriculum.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Subject Name</Label>
                  <Input 
                    placeholder="e.g. Theoretical Physics" 
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Target Class</Label>
                  <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classes.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Assign Faculty</Label>
                  <Select value={form.teacherId} onValueChange={v => setForm(f => ({ ...f, teacherId: v }))}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {teachers.map(t => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4" disabled={creating || !form.classId}>
                  {creating ? 'Assigning...' : 'Confirm Subject'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Curriculum...</p>
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="Curriculum is empty" description="Add subjects and assign them to specific classes and faculty." />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Subject Name</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Assigned Class</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Faculty Lead</th>
                  <th className="py-5 px-6 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((s, idx) => {
                  const colors = ['bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-blue-100 text-blue-600', 'bg-amber-100 text-amber-600', 'bg-rose-100 text-rose-600'];
                  const colorClass = colors[idx % colors.length];
                  return (
                    <tr key={s._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-11 w-11 rounded-xl ${colorClass} flex items-center justify-center font-black shadow-sm group-hover:rotate-12 transition-transform duration-500`}>
                            <BookCheck size={18}/>
                          </div>
                          <p className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{s.name}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                           <BookOpen size={14} className="text-slate-300" />
                           {s.classId?.name} {s.classId?.section ? `(${s.classId.section})` : ''}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                              {(s.teacherId?.name || 'U').charAt(0)}
                           </div>
                           <p className="text-xs font-bold text-slate-600">{s.teacherId?.name || <span className="text-slate-300 italic">Unassigned</span>}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                          <Button 
                            variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-rose-600" 
                            onClick={() => handleDelete(s._id)}
                            title="Remove Subject"
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
