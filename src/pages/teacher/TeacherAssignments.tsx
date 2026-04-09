import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Calendar, BookCheck, ClipboardList, Clock, Sparkles, CheckCircle2, XCircle, ExternalLink, GraduationCap } from 'lucide-react';

type Assignment = { _id: string; title: string; dueDate: string; classId: any; subjectId: any };
type ClassItem = { _id: string; name: string; section?: string };
type Subject = { _id: string; name: string; classId: string };

export default function TeacherAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [teacherRecordId, setTeacherRecordId] = useState('');
  
  // Submissions State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [gradingId, setGradingId] = useState<string | null>(null);

  const [form, setForm] = useState({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [assRes, classRes, subRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      setAssignments(assRes.data || []);
      setClasses(classRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAll(); 
    api.get('/teachers/me').then(({ data }) => setTeacherRecordId(data._id)).catch(() => {});
  }, []);

  const fetchSubmissions = async (assignmentId: string) => {
    try {
        setLoadingSubmissions(true);
        const { data } = await api.get(`/submissions?assignmentId=${assignmentId}`);
        setSubmissions(data || []);
    } catch (err) {
        toast.error('Failed to load submissions');
    } finally {
        setLoadingSubmissions(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCreating(true);
    try {
      await api.post('/assignments', {
        ...form,
        teacherId: teacherRecordId || profile.id
      });
      toast.success('Assignment published to students');
      setDialogOpen(false);
      setForm({ title: '', description: '', dueDate: '', classId: '', subjectId: '' });
      fetchAll();
    } catch (err: any) {
      toast.error('Failed to publish assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to retract this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleGrade = async (submissionId: string) => {
    try {
        await api.put(`/submissions/${submissionId}/grade`, gradeForm);
        toast.success('Grade recorded');
        setGradingId(null);
        if (selectedAssignmentId) fetchSubmissions(selectedAssignmentId);
    } catch (err) {
        toast.error('Failed to save grade');
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Curriculum Tasks"
        description="Design and distribute assignments to your assigned classrooms and track submission lifecycles."
        icon={<ClipboardList size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><FileText size={100}/></div>
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black text-white">New Curriculum Task</DialogTitle>
                   <p className="text-indigo-100/70 text-sm font-medium">Define assignment parameters and deadlines.</p>
                 </DialogHeader>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text">Task Title</Label>
                  <Input 
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="e.g. World War II Analysis"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 group">
                        <Label className="label-text">Target Class</Label>
                        <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select class" /></SelectTrigger>
                            <SelectContent className="rounded-xl">{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5 group">
                        <Label className="label-text">Select Subject</Label>
                        <Select value={form.subjectId} onValueChange={v => setForm(f => ({ ...f, subjectId: v }))}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent className="rounded-xl">{subjects.filter(s => (typeof s.classId === 'string' ? s.classId : (s as any).classId?._id) === form.classId).map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text">Submission Deadline</Label>
                  <div className="relative">
                    <Input 
                      type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} 
                      className="h-12 rounded-xl border-slate-200 pl-10"
                      required 
                    />
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4 shadow-primary hover:shadow-glow" disabled={creating}>
                  {creating ? 'Publishing...' : 'Broadcast Task'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Tasks...</p>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState icon={<BookCheck className="h-10 w-10 text-slate-300" />} title="Task Queue Empty" description="You haven't published any assignments yet. Create one to begin tracking student performance." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignments.map((a, idx) => {
            const isLate = new Date() > new Date(a.dueDate);
            return (
              <div key={a._id} className="card-premium p-8 bg-white/70 backdrop-blur-md border-none group hover:scale-[1.03] transition-all duration-500 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full bg-primary opacity-30`} />
                
                <div className="flex justify-between items-start mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform duration-500">
                    <FileText size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Sheet onOpenChange={(open) => { if (open) { setSelectedAssignmentId(a._id); fetchSubmissions(a._id); } }}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 rounded-xl bg-slate-50 text-slate-500 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                                Submissions
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-lg rounded-l-[3rem] p-0 border-none shadow-2xl">
                           <div className="bg-gradient-dark p-10 text-white relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-10 opacity-10"><GraduationCap size={150}/></div>
                              <SheetHeader className="relative z-10">
                                <SheetTitle className="text-3xl font-black text-white">{a.title}</SheetTitle>
                                <p className="text-indigo-200/60 font-bold uppercase tracking-widest text-[10px]">Submission Tracking Portal</p>
                              </SheetHeader>
                           </div>
                           <div className="p-10 bg-white h-full overflow-y-auto custom-scrollbar pb-32">
                               {loadingSubmissions ? (
                                   <div className="flex justify-center py-20"><div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                               ) : submissions.length === 0 ? (
                                   <p className="text-center text-slate-400 font-bold py-10">No submissions yet.</p>
                               ) : (
                                   <div className="space-y-6">
                                       {submissions.map(s => (
                                           <div key={s._id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                               <div className="flex items-center justify-between">
                                                  <div>
                                                    <p className="font-black text-slate-800">{s.studentId?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Roll: {s.studentId?.rollNumber}</p>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                     {s.status === 'graded' ? (
                                                       <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-1.5">
                                                          <CheckCircle2 size={12} /> Grade: {s.grade}
                                                       </span>
                                                     ) : (
                                                       <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100 flex items-center gap-1.5">
                                                          <Clock size={12} /> Pending
                                                       </span>
                                                     )}
                                                  </div>
                                               </div>
                                               <div className="p-4 bg-white rounded-2xl text-xs text-slate-600 font-medium leading-relaxed italic border border-slate-50">
                                                  "{s.content || "No text content"}"
                                               </div>
                                               {s.fileUrl && (
                                                   <a href={s.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[10px] font-black text-primary uppercase hover:underline">
                                                       <ExternalLink size={12} /> View Attached File
                                                   </a>
                                               )}

                                               {gradingId === s._id ? (
                                                   <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                      <div className="grid grid-cols-3 gap-4">
                                                         <div className="col-span-1">
                                                            <Label className="text-[10px] font-black uppercase">Grade</Label>
                                                            <Input placeholder="A+" className="h-10 rounded-xl" value={gradeForm.grade} onChange={e => setGradeForm(g => ({...g, grade: e.target.value}))} />
                                                         </div>
                                                         <div className="col-span-2">
                                                            <Label className="text-[10px] font-black uppercase">Feedback</Label>
                                                            <Input placeholder="Excellent work!" className="h-10 rounded-xl" value={gradeForm.feedback} onChange={e => setGradeForm(g => ({...g, feedback: e.target.value}))} />
                                                         </div>
                                                      </div>
                                                      <div className="flex gap-2">
                                                         <Button onClick={() => handleGrade(s._id)} className="flex-1 h-10 rounded-xl bg-slate-900 text-white font-black uppercase text-[10px]">Save</Button>
                                                         <Button onClick={() => setGradingId(null)} variant="ghost" className="h-10 rounded-xl text-slate-400 font-black uppercase text-[10px]">Cancel</Button>
                                                      </div>
                                                   </div>
                                               ) : (
                                                   <Button onClick={() => { setGradingId(s._id); setGradeForm({ grade: s.grade || '', feedback: s.feedback || '' }); }} variant="outline" className="w-full h-10 rounded-xl border-dashed border-slate-200 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-all">
                                                       {s.status === 'graded' ? 'Update Grade' : 'Grade Assignment'}
                                                   </Button>
                                               )}
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                        </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a._id)} className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <h3 className="font-black text-xl text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">{a.title}</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                   <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">/ {a.subjectId?.name || 'Unit'}</span>
                   <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-black uppercase text-primary tracking-widest">{a.classId?.name}</span>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-2">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-500 shadow-sm border border-amber-100`}>
                        <Clock size={14} className={isLate ? 'animate-pulse' : ''} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Due Date</span>
                        <span className="text-xs font-black text-slate-700 tabular-nums">
                           {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                     </div>
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
