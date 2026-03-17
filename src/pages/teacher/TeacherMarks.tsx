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
import { Plus, Award } from 'lucide-react';

type Student = { id: string; full_name: string };
type ClassItem = { id: string; name: string; section: string | null };
type Subject = { id: string; name: string; class_id: string };

export default function TeacherMarks() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [marks, setMarks] = useState<Record<string, { obtained: string; total: string }>>({});
  const [examName, setExamName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase.from('subjects').select('id, name, class_id').eq('teacher_id', profile.id).then(({ data }) => {
      setSubjects((data as Subject[]) || []);
      const classIds = [...new Set((data || []).map(s => s.class_id))];
      if (classIds.length > 0) {
        supabase.from('classes').select('id, name, section').in('id', classIds).then(({ data }) => {
          setClasses((data as ClassItem[]) || []);
        });
      }
    });
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
    supabase.from('enrollments').select('student_id').eq('class_id', selectedClass).then(async ({ data }) => {
      if (!data?.length) { setStudents([]); return; }
      const ids = data.map(e => e.student_id);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
      setStudents((profiles as Student[]) || []);
    });
  }, [selectedClass]);

  const filteredSubjects = subjects.filter(s => s.class_id === selectedClass);

  const handleSave = async () => {
    if (!profile || !selectedClass || !selectedSubject || !examName) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        school_id: profile.school_id,
        class_id: selectedClass,
        subject_id: selectedSubject,
        student_id: s.id,
        exam_name: examName,
        marks_obtained: parseFloat(marks[s.id]?.obtained || '0'),
        total_marks: parseFloat(marks[s.id]?.total || '100'),
        created_by: profile.id,
      }));
      const { error } = await supabase.from('marks').insert(records);
      if (error) throw error;
      toast.success('Marks recorded');
      setDialogOpen(false);
      setMarks({});
      setExamName('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Marks"
        description="Record and manage student marks."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />Record Marks</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Record Marks</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="label-text">Class</Label>
                  <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedSubject(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Exam Name</Label>
                  <Input placeholder="Midterm Exam" value={examName} onChange={e => setExamName(e.target.value)} />
                </div>

                {students.length > 0 && (
                  <div className="space-y-2">
                    <Label className="label-text">Student Marks</Label>
                    {students.map(s => (
                      <div key={s.id} className="flex items-center gap-3">
                        <span className="text-sm flex-1 truncate">{s.full_name}</span>
                        <Input
                          type="number"
                          placeholder="Score"
                          className="w-20"
                          value={marks[s.id]?.obtained || ''}
                          onChange={e => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], obtained: e.target.value, total: m[s.id]?.total || '100' } }))}
                        />
                        <span className="text-muted-foreground text-sm">/</span>
                        <Input
                          type="number"
                          placeholder="Total"
                          className="w-20"
                          value={marks[s.id]?.total || '100'}
                          onChange={e => setMarks(m => ({ ...m, [s.id]: { ...m[s.id], total: e.target.value, obtained: m[s.id]?.obtained || '0' } }))}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={handleSave} className="w-full" disabled={saving || !examName || !selectedSubject}>
                  {saving ? 'Saving...' : 'Save Marks'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <EmptyState icon={<Award className="h-6 w-6" />} title="Record marks" description="Use the Record Marks button to enter exam scores for your students." />
    </div>
  );
}
