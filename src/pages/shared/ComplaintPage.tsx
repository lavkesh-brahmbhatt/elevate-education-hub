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
import { MessageSquare, Plus, CheckCircle2, Clock, Send, ShieldAlert, User, Search, Filter } from 'lucide-react';

type Complaint = {
  _id: string;
  userId: { email: string };
  userRole: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Resolved';
  response: string | null;
  createdAt: string;
};

export default function ComplaintPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolveResponses, setResolveResponses] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ subject: '', message: '' });

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';
  const isManagement = isAdmin || isTeacher;

  const fetchComplaints = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data } = await api.get('/complaints');
      setComplaints((data as Complaint[]) || []);
    } catch (err) {
      toast.error('Failed to load concerns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', { subject: form.subject, message: form.message });
      toast.success('Your concern has been registered and queued for review.');
      setDialogOpen(false);
      setForm({ subject: '', message: '' });
      fetchComplaints();
    } catch (err: any) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const response = resolveResponses[id];
    if (!response) return;
    try {
      await api.put(`/complaints/${id}/resolve`, { response });
      toast.success('Resolution synchronized with student profile.');
      setResolveResponses(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      fetchComplaints();
    } catch (err: any) {
      toast.error('Failed to resolve');
    }
  };

  return (
    <div className="stagger">
      <PageHeader
        title="Help & Resolution Center"
        description={isManagement ? "Centralized hub for managing school-wide grievances and student concerns." : "Direct communication channel to school administration for help and feedback."}
        icon={<MessageSquare size={28} />}
        action={!isManagement && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Post Concern
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10"><Send size={100}/></div>
                 <DialogHeader>
                   <DialogTitle className="text-2xl font-black text-white">Raise a Concern</DialogTitle>
                   <p className="text-indigo-100/70 text-sm font-medium">Your feedback helps us improve the school environment.</p>
                 </DialogHeader>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Subject of Interest</Label>
                  <Input 
                    value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="e.g. Laboratory Equipment Issue"
                    required 
                  />
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Detailed Explanation</Label>
                  <Textarea 
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} 
                    className="rounded-xl border-slate-200 min-h-[120px] focus:ring-primary/10"
                    placeholder="Provide as much detail as possible to help us resolve the issue..."
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4" disabled={submitting}>
                  {submitting ? 'Submitting Signal...' : 'Confirm Submission'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      <div className="flex items-center justify-between mb-6 px-2">
         <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl cursor-pointer transition-all text-xs font-black uppercase tracking-widest bg-white border border-slate-100 shadow-sm text-primary`}>All Tickets</div>
            <div className={`px-4 py-2 rounded-xl cursor-not-allowed opacity-50 transition-all text-xs font-black uppercase tracking-widest text-slate-100`}>Filter By Status</div>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Signals...</p>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState icon={<ShieldAlert className="h-10 w-10" />} title="Zero Tickets Oufstanding" description="No active concerns have been reported. The school system is operating at peak efficiency." />
      ) : (
        <div className="grid gap-6 max-w-4xl">
          {complaints.map((c) => (
            <div key={c._id} className="card-premium border-none bg-white font-inter overflow-hidden hover:scale-[1.01] transition-transform duration-300">
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                       <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'} shadow-sm`}>
                          {c.status === 'Resolved' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-slate-800 leading-tight">{c.subject}</h3>
                          <div className="flex items-center gap-4 mt-1">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <User size={12} className="text-slate-300" /> {c.userId?.email || 'System User'}
                             </div>
                             <div className="h-1 w-1 rounded-full bg-slate-200" />
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Clock size={12} className="text-slate-300" /> {new Date(c.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 relative group/msg">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover/msg:opacity-10"><MessageSquare size={40} /></div>
                   <p className="text-[13px] font-medium text-slate-600 leading-bold italic whitespace-pre-wrap">"{c.message}"</p>
                </div>
              </div>

              {c.status === 'Resolved' ? (
                <div className="p-8 bg-emerald-50/30 border-t border-emerald-100/50">
                  <div className="flex items-center gap-2 mb-3">
                     <div className="h-6 w-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><Send size={12} /></div>
                     <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Resolution Response</p>
                  </div>
                  <p className="text-[14px] font-bold text-slate-700 leading-relaxed pl-8 border-l-2 border-emerald-200 ml-3">{c.response}</p>
                </div>
              ) : isManagement ? (
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <form onSubmit={(e) => handleResolve(e, c._id)} className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                       <Label className="label-text">Official Resolution Response</Label>
                       <Input 
                         placeholder="Synthesize a response to this concern..." 
                         className="h-12 rounded-xl bg-white border-slate-200 text-sm font-medium"
                         value={resolveResponses[c._id] || ''}
                         onChange={e => setResolveResponses(prev => ({ ...prev, [c._id]: e.target.value }))}
                         required
                       />
                    </div>
                    <Button type="submit" className="h-12 px-8 rounded-xl bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">Resolve Signal</Button>
                  </form>
                </div>
              ) : (
                <div className="p-6 bg-slate-50/30 border-t border-slate-100 flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Awaiting Management Verification</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
