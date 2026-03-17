import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';

type Subject = { id: string; name: string; class_id: string; teacher_id: string | null; created_at: string };
type ClassItem = { id: string; name: string; section: string | null };
type Teacher = { id: string; full_name: string };

export default function ManageSubjects() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', class_id: '', teacher_id: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    if (!profile) return;
    const [subRes, classRes, teachRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
      supabase.from('classes').select('id, name, section').eq('school_id', profile.school_id),
      supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'teacher'),
    ]);
    setSubjects((subRes.data as Subject[]) || []);
    setClasses((classRes.data as ClassItem[]) || []);
    setTeachers((teachRes.data as Teacher[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('subjects').insert({
        school_id: profile.school_id,
        name: form.name,
        class_id: form.class_id,
        teacher_id: form.teacher_id || null,
      });
      if (error) throw error;
      toast.success('Subject added');
      setDialogOpen(false);
      setForm({ name: '', class_id: '', teacher_id: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const getClassName = (classId: string) => {
    const c = classes.find(cl => cl.id === classId);
    return c ? `${c.name}${c.section ? ` (${c.section})` : ''}` : '';
  };

  const getTeacherName = (teacherId: string | null) => {
    if (!teacherId) return 'Unassigned';
    return teachers.find(t => t.id === teacherId)?.full_name || '';
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
                  <Label className="label-text">Assign Teacher</Label>
                  <Select value={form.teacher_id} onValueChange={v => setForm(f => ({ ...f, teacher_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating || !form.class_id}>
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
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{getClassName(s.class_id)}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{getTeacherName(s.teacher_id)}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm" onClick={async () => {
                      await supabase.from('subjects').delete().eq('id', s.id);
                      toast.success('Subject removed');
                      fetchData();
                    }}>
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
