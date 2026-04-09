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
import { Plus, Award, BookCheck, ClipboardList, Target, TrendingUp, Save, Search, User } from 'lucide-react';

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
    api.get('/classes').then(({ data }) => setClasses(data || []));
    api.get('/subjects').then(({ data }) => setSubjects(data || []));
    fetchMarks();
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
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
        marksObtained: parseFloat(marks[s._id]?.obtained || '100'),
        maxMarks: parseFloat(marks[s._id]?.total || '100'),
      }));

      await api.post('/marks/bulk', { records });
      toast.success('Examination results synchronized successfully');
      setDialogOpen(false);
      setMarks({});
      setExamName('');
      fetchMarks();
    } catch (err: any) {
      toast.error('Failed to sync marks');
    } finally {
      setSaving(false);
    }
  };

  const marksBySubject = existingMarks.reduce((acc, current) => {
    const subName = current.subjectId?.name || 'Intersubjective Logic';
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(current);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="stagger">
      <PageHeader
        title="Gradebook Terminal"
        description="Official faculty interface for recording and certifying student examination results."
        icon={<BookCheck size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Record Mark Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Award size={100}/></div>
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black text-white">Academic Certification</DialogTitle>
                   <p className="text-indigo-100/70 text-sm font-medium">Capture exam scores and synchronize with student transcripts.</p>
                 </DialogHeader>
              </div>
              <div className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 group">
                    <Label className="label-text">Academic Class</Label>
                    <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedSubject(''); }}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text">Select Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {filteredSubjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 group">
                   <Label className="label-text">Assessment Lifecycle</Label>
                   <Select value={examName} onValueChange={setExamName}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select assessment type" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Midterm">Midterm Examination</SelectItem>
                        <SelectItem value="Final">Grand Final Evaluation</SelectItem>
                        <SelectItem value="Quiz">Quick Assessment Quiz</SelectItem>
                        <SelectItem value="Assignment">Project Assignment</SelectItem>
                        <SelectItem value="Unit Test">Periodic Unit Test</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                {students.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Class Roll Scorecard</Label>
                    <div className="space-y-3">
                      {students.map(s => (
                        <div key={s._id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-white transition-all group/row">
                          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center font-black text-[10px] text-slate-400 group-hover/row:bg-primary group-hover/row:text-white transition-colors uppercase">
                             {s.name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-700 flex-1 truncate">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number" placeholder="0" className="w-20 h-10 rounded-lg border-slate-200 text-center font-black"
                              value={marks[s._id]?.obtained || ''}
                              onChange={e => setMarks(m => ({ ...m, [s._id]: { ...m[s._id], obtained: e.target.value, total: m[s._id]?.total || '100' } }))}
                            />
                            <span className="text-slate-300 font-black">/</span>
                            <Input
                              type="number" placeholder="100" className="w-20 h-10 rounded-lg border-slate-200 bg-slate-100 text-center font-bold opacity-70"
                              value={marks[s._id]?.total || '100'}
                              onChange={e => setMarks(m => ({ ...m, [s._id]: { ...m[s._id], total: e.target.value, obtained: m[s._id]?.obtained || '100' } }))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4 shadow-primary hover:shadow-glow disabled:opacity-50" disabled={saving || !examName || !selectedSubject}>
                  {saving ? 'Synchronizing Node...' : 'Commit Results'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {existingMarks.length === 0 ? (
        <EmptyState icon={<ClipboardList size={40} />} title="Gradebook Empty" description="Your faculty node has no recorded marks. Use the Commitment Terminal to synchronize exam results." />
      ) : (
        <div className="space-y-12">
          {Object.entries(marksBySubject).map(([subject, marks]) => (
            <div key={subject} className="card-premium border-none bg-white/70 backdrop-blur-md overflow-hidden group">
              <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"><BookCheck size={20} /></div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">{subject}</h3>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Curriculum Unit</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-black text-slate-300 uppercase tracking-tighter">
                   <Target size={14} /> Total Records: {marks.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/20">
                      <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Student Identity</th>
                      <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Assigned Class</th>
                      <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 italic">Assessment</th>
                      <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(marks as any[]).map((m: any) => {
                       const pct = (m.marksObtained / m.maxMarks * 100);
                       return (
                        <tr key={m._id} className="group/row hover:bg-white transition-all duration-300">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                  {m.studentId?.name?.charAt(0) || <User size={12} />}
                               </div>
                               <p className="text-sm font-black text-slate-700">{m.studentId?.name || 'External Student'}</p>
                            </div>
                          </td>
                          <td className="py-5 px-8 text-xs font-bold text-slate-400 uppercase tracking-tight">
                            {m.classId?.name} {m.classId?.section}
                          </td>
                          <td className="py-5 px-8 text-xs font-black text-primary uppercase tracking-widest italic">
                            {m.examType}
                          </td>
                          <td className="py-5 px-8 text-right">
                             <div className="inline-flex flex-col items-end">
                                <span className={`text-sm font-black ${pct >= 75 ? 'text-emerald-500' : (pct >= 40 ? 'text-indigo-500' : 'text-rose-500')}`}>
                                   {m.marksObtained} <span className="text-slate-300 font-normal">/ {m.maxMarks}</span>
                                </span>
                                <div className="h-1 w-16 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                   <div className={`h-full ${pct >= 75 ? 'bg-emerald-500' : (pct >= 40 ? 'bg-indigo-500' : 'bg-rose-500')} rounded-full`} style={{ width: `${pct}%` }} />
                                </div>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-primary transition-colors">
                    Export Unit Report <TrendingUp size={12} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
