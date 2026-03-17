import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, BookOpen, Trash2 } from 'lucide-react';

type ClassItem = { id: string; name: string; section: string | null; grade_level: string | null; created_at: string };

export default function ManageClasses() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', section: '', grade_level: '' });
  const [creating, setCreating] = useState(false);

  const fetchClasses = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });
    setClasses((data as ClassItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('classes').insert({
        school_id: profile.school_id,
        name: form.name,
        section: form.section || null,
        grade_level: form.grade_level || null,
      });
      if (error) throw error;
      toast.success('Class created');
      setDialogOpen(false);
      setForm({ name: '', section: '', grade_level: '' });
      fetchClasses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Classes"
        description="Manage classes and sections."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Create Class</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Class</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-text">Class Name</Label>
                  <Input placeholder="Grade 10" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="label-text">Section</Label>
                    <Input placeholder="A" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-text">Grade Level</Label>
                    <Input placeholder="10" value={form.grade_level} onChange={e => setForm(f => ({ ...f, grade_level: e.target.value }))} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Class'}
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
      ) : classes.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No classes yet" description="Create your first class to organize students." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-card rounded-xl shadow-card p-5 group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[c.section && `Section ${c.section}`, c.grade_level && `Grade ${c.grade_level}`].filter(Boolean).join(' · ') || 'No details'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    await supabase.from('classes').delete().eq('id', c.id);
                    toast.success('Class deleted');
                    fetchClasses();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
