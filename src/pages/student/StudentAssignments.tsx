import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Calendar, Clock, AlertCircle, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Send, MessageSquare } from 'lucide-react';

type Assignment = { _id: string; title: string; dueDate: string; classId: { name: string }; subjectId: { name: string } };

export default function StudentAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Submission Form State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data: assRes } = await api.get('/assignments');
      const assList = (assRes as Assignment[]) || [];
      setAssignments(assList);

      // Fetch submissions for each assignment
      const subMap: Record<string, any> = {};
      await Promise.all(assList.map(async (a) => {
          try {
              const { data: sub } = await api.get(`/submissions/my?assignmentId=${a._id}`);
              if (sub) subMap[a._id] = sub;
          } catch (e) { /* ignore */ }
      }));
      setSubmissions(subMap);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await api.post('/submissions', {
        assignmentId: selectedId,
        content
      });
      toast.success('Assignment submitted successfully');
      setSelectedId(null);
      setContent('');
      fetchAll();
    } catch (err: any) {
      toast.error('Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="stagger">
      <PageHeader 
        title="Active Assignments" 
        description="Monitor your academic tasks, research projects, and upcoming submission deadlines." 
        icon={<FileText size={28} />}
      />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Tasks...</p>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState 
            icon={<ShieldCheck className="h-10 w-10 text-emerald-500" />} 
            title="All Cleared" 
            description="Exceptional work! You've successfully synchronized and completed all current assignments." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assignments.map((a, idx) => {
            const isLate = new Date() > new Date(a.dueDate);
            const submission = submissions[a._id];
            const isSubmitted = !!submission;
            
            return (
              <div key={a._id} className="card-premium p-8 bg-white/70 backdrop-blur-md border-none group hover:scale-[1.05] transition-all duration-500 flex flex-col relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${isSubmitted ? 'bg-emerald-500' : isLate ? 'bg-rose-500' : 'bg-primary'}`} />
                
                <div className="flex items-start justify-between mb-8">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-all duration-500 ${isSubmitted ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                    {isSubmitted ? <CheckCircle2 size={24} /> : <FileText size={20} />}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border transition-all ${
                    isSubmitted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    isLate ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {isSubmitted ? 'Submitted' : isLate ? 'Past Due' : 'Pending'}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-black text-xl text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">{a.title}</h3>
                  <div className="flex items-center gap-2 mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-400 rounded-md">/ {a.subjectId?.name || 'Unit'}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-indigo-400 rounded-md">{a.classId?.name || 'Class'}</span>
                  </div>
                </div>

                {submission?.status === 'graded' && (
                    <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-indigo-400">Assignment Grade</span>
                            <span className="text-sm font-black text-indigo-600">{submission.grade}</span>
                        </div>
                        {submission.feedback && (
                            <p className="text-[10px] font-medium text-indigo-400/80 italic flex gap-1 items-start">
                                <MessageSquare size={10} className="mt-1" /> "{submission.feedback}"
                            </p>
                        )}
                    </div>
                )}

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                   <div className="flex items-center gap-2">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isSubmitted ? 'bg-emerald-50 text-emerald-500' : isLate ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                        <Clock size={14} className={!isSubmitted && isLate ? 'animate-pulse' : ''} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Deadline</span>
                        <span className="text-xs font-black text-slate-700 tabular-nums">
                           {new Date(a.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                     </div>
                   </div>
                   
                   {!isSubmitted && (
                       <Dialog open={selectedId === a._id} onOpenChange={(o) => setSelectedId(o ? a._id : null)}>
                           <DialogTrigger asChild>
                               <Button size="icon" className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 text-white hover:scale-110 active:scale-95 transition-all">
                                   <ArrowRight size={18} />
                               </Button>
                           </DialogTrigger>
                           <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                               <div className="bg-gradient-dark p-8 text-white relative">
                                   <div className="absolute top-0 right-0 p-8 opacity-10"><Send size={100}/></div>
                                   <DialogTitle className="text-2xl font-black">Submit Task</DialogTitle>
                                   <p className="text-indigo-200/60 text-sm font-medium">{a.title}</p>
                               </div>
                               <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
                                   <div className="space-y-1.5 group">
                                       <Label className="label-text">Submission Content</Label>
                                       <Textarea 
                                           required
                                           placeholder="Type your submission here..." 
                                           className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-primary/10 transition-all font-medium text-sm"
                                           value={content}
                                           onChange={e => setContent(e.target.value)}
                                       />
                                   </div>
                                   <Button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl bg-gradient-dark text-white font-black uppercase mt-4 shadow-xl shadow-indigo-500/20">
                                       {submitting ? 'Transmitting...' : 'Upload Submission'}
                                   </Button>
                               </form>
                           </DialogContent>
                       </Dialog>
                   )}
                </div>

                {idx === 0 && !isLate && !isSubmitted && (
                   <div className="absolute top-0 right-0 p-2 opacity-5 scale-[2] rotate-12 pointer-events-none group-hover:opacity-20 transition-opacity">
                      <Sparkles size={100} />
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
