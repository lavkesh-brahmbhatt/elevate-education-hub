import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, BookOpen, Trash2, Layers, Sparkles, GraduationCap, ArrowRight } from 'lucide-react';

type ClassItem = { _id: string; name: string; section: string | null; grade_level: string | null; createdAt: string };

export default function ManageClasses() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', section: '', grade_level: '' });
  const [creating, setCreating] = useState(false);

  const fetchClasses = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data } = await api.get('/classes');
      setClasses((data as ClassItem[]) || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      await api.post('/classes', {
        name: form.name,
        section: form.section || null,
        grade_level: form.grade_level || null,
      });
      toast.success('Class created successfully');
      setDialogOpen(false);
      setForm({ name: '', section: '', grade_level: '' });
      fetchClasses();
    } catch (err: any) {
      toast.error('Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This may affect student assignments.')) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Class deleted');
      fetchClasses();
    } catch (err) {
      toast.error('Failed to delete class');
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Classroom Management"
        description="Organize your school structure by defining classes, sections, and grade levels."
        icon={<Layers size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Create New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={100}/></div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white">Define Class</DialogTitle>
                  <p className="text-indigo-100/70 text-sm font-medium">Create a new academic group for your school.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Class Name</Label>
                  <Input 
                    placeholder="e.g. Grade 10" 
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Section</Label>
                    <Input 
                      placeholder="e.g. A" 
                      value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} 
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Grade Level</Label>
                    <Input 
                      placeholder="e.g. 10" 
                      value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} 
                      className="h-12 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4" disabled={creating}>
                  {creating ? 'Creating...' : 'Initialize Class'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Classrooms...</p>
        </div>
      ) : classes.length === 0 ? (
        <EmptyState icon={<Layers className="h-10 w-10" />} title="No classrooms yet" description="The school floorplan is empty. Define your first class to organize students." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c, idx) => {
            const gradients = [
              'from-indigo-500 to-indigo-700',
              'from-blue-500 to-blue-700',
              'from-emerald-500 to-emerald-700',
              'from-amber-500 to-amber-700',
              'from-rose-500 to-rose-700'
            ];
            const g = gradients[idx % gradients.length];
            return (
              <div key={c._id} className="card-premium bg-white group hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                {/* Decorative Side Strip */}
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${g} opacity-60`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <GraduationCap size={24} />
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(c._id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                       {c.name}
                       {c.section && <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.section}</span>}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                       Grade {c.grade_level || 'N/A'} · Active Session
                    </p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational</span>
                    </div>
                    <button onClick={() => navigate(`/dashboard/students?classId=${c._id}`)} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group/btn hover:underline decoration-2">
                       View Class <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
