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
import { MessageSquare, Plus, CheckCircle2, Clock, Send } from 'lucide-react';

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
      toast.success('Your concern has been submitted and will be reviewed.');
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
      toast.success('Concern marked as resolved.');
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
    <div className="animate-fade-in">
      <PageHeader
        title="Complaints & Concerns"
        description={isManagement ? "Manage and resolve issues raised by students and parents." : "Raise an issue or track the status of your concerns."}
        action={!isManagement && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Raise Concern</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit a Concern</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Brief title of your concern" />
                </div>
                <div className="space-y-2">
                  <Label>Detailed Message</Label>
                  <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required placeholder="Describe the issue in detail..." rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : complaints.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No concerns filed" description="Everything seems to be running smoothly!" />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-card rounded-xl shadow-card overflow-hidden border border-border group hover:border-primary/20 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{c.subject}</h3>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        c.status === 'Resolved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {c.status === 'Resolved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted by <span className="font-medium text-foreground">{c.userId?.email || 'Student'}</span> • {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground bg-subtle/30 p-4 rounded-lg italic leading-relaxed">"{c.message}"</p>
              </div>

              {c.status === 'Resolved' ? (
                <div className="px-6 py-4 bg-primary/5 border-t border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Send className="h-3 w-3" /> Response
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">{c.response}</p>
                </div>
              ) : isManagement ? (
                <div className="px-6 py-4 bg-muted/20 border-t border-border">
                  <form onSubmit={(e) => handleResolve(e, c._id)} className="flex gap-3">
                    <Input 
                      placeholder="Add a response to resolve..." 
                      className="flex-1"
                      value={resolveResponses[c._id] || ''}
                      onChange={e => setResolveResponses(prev => ({ ...prev, [c._id]: e.target.value }))}
                      required
                    />
                    <Button type="submit" size="sm">Resolve Now</Button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
