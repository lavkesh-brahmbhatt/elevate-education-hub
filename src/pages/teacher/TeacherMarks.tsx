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
import { Plus, Award } from 'lucide-react';

type Student = { _id: string; name: string };
type ClassItem = { _id: string; name: string; section: string | null };
type Subject = { _id: string; name: string; classId: string };

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

  const [existingMarks, setExistingMarks] = useState<any[]>([]);

  const fetchMarks = () => {
    api.get('/marks').then(({ data }) => setExistingMarks(data || []));
  };

  useEffect(() => {
    if (!profile) return;
    // Fetch classes and subjects
    api.get('/classes').then(({ data }) => setClasses(data || []));
    api.get('/subjects').then(({ data }) => setSubjects(data || []));
    fetchMarks();
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
    // Fetch students for this class
    api.get(`/students?classId=${selectedClass}`).then(({ data }) => setStudents(data || []));
  }, [selectedClass]);

  const filteredSubjects = subjects.filter(s => {
    const classIdStr = (typeof s.classId === 'string' ? s.classId : (s as any).classId?._id);
    return classIdStr === selectedClass;
  });

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !examName) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        classId: selectedClass,
        subjectId: selectedSubject,
        studentId: s._id,
        examType: examName,
        marksObtained: parseFloat(marks[s._id]?.obtained || '0'),

        maxMarks: parseFloat(marks[s._id]?.total || '100'),
      }));

      await api.post('/marks/bulk', { records });
      toast.success('Marks recorded successfully');
      setDialogOpen(false);
      setMarks({});
      setExamName('');
      fetchMarks();
    } catch (err: any) {
      toast.error('Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  // Group marks by subject for readability
  const marksBySubject = existingMarks.reduce((acc, current) => {
    const subName = current.subjectId?.name || 'Unknown Subject';
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(current);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="animate-fade-in pb-10">
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
                      {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Exam Name</Label>
                  <Select value={examName} onValueChange={setExamName}>
                    <SelectTrigger><SelectValue placeholder="Select exam type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Midterm">Midterm</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Unit Test">Unit Test</SelectItem>

                    </SelectContent>
                  </Select>
                </div>

                {students.length > 0 && (
                  <div className="space-y-2">
                    <Label className="label-text">Student Marks</Label>
                    {students.map(s => (
                      <div key={s._id} className="flex items-center gap-3">
                        <span className="text-sm flex-1 truncate">{s.name}</span>
                        <Input
                          type="number"
                          placeholder="Score"
                          className="w-20"
                          value={marks[s._id]?.obtained || ''}
                          onChange={e => setMarks(m => ({ ...m, [s._id]: { ...m[s._id], obtained: e.target.value, total: m[s._id]?.total || '100' } }))}
                        />
                        <span className="text-muted-foreground text-sm">/</span>
                        <Input
                          type="number"
                          placeholder="Total"
                          className="w-20"
                          value={marks[s._id]?.total || '100'}
                          onChange={e => setMarks(m => ({ ...m, [s._id]: { ...m[s._id], total: e.target.value, obtained: m[s._id]?.obtained || '0' } }))}
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

      {existingMarks.length === 0 ? (
        <EmptyState icon={<Award className="h-6 w-6" />} title="Record marks" description="Use the Record Marks button to enter exam scores for your students." />
      ) : (
        <div className="space-y-8">
          {Object.entries(marksBySubject).map(([subject, marks]) => (
            <div key={subject} className="bg-card rounded-xl shadow-card overflow-hidden border border-border">
              <div className="px-6 py-4 bg-muted/20 border-b border-border">
                <h3 className="font-semibold">{subject}</h3>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-subtle/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Class</th>
                    <th className="py-3 px-6">Exam Type</th>
                    <th className="py-3 px-6 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(marks as any[]).map((m: any) => (
                    <tr key={m._id} className="border-b border-border last:border-0 hover:bg-subtle/20 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium">{m.studentId?.name || 'N/A'}</td>
                      <td className="py-3 px-6 text-sm text-muted-foreground">{m.classId?.name} {m.classId?.section}</td>
                      <td className="py-3 px-6 text-sm italic">{m.examType}</td>
                      <td className="py-3 px-6 text-sm text-right font-bold text-primary">
                        {m.marksObtained} / {m.maxMarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
