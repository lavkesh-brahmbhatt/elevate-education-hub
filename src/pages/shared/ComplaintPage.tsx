
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  id: string;
  student_id: string;
  subject: string;
  description: string;
  status: 'pending' | 'resolved';
  admin_response: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function ComplaintPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolveForm, setResolveForm] = useState({ id: '', response: '' });
  const [form, setForm] = useState({ subject: '', description: '' });

  const isAdmin = profile?.role === 'admin';
  const isParentOrStudent = profile?.role === 'student' || profile?.role === 'parent';

  const fetchComplaints = async () => {
    if (!profile) return;
    let query = supabase
      .from('complaints')
      .select('*, profiles:student_id(full_name)')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      if (profile.role === 'student') {
        query = query.eq('student_id', profile.id);
      } else if (profile.role === 'parent') {
        const { data: children } = await supabase.from('parent_student_links').select('student_id').eq('parent_id', profile.id);
        const childIds = (children || []).map(c => c.student_id);
        query = query.in('student_id', childIds);
      }
    }

    const { data } = await query;
    setComplaints((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    try {
      // For parents, we'd need to select which child. For now assume it's linked to the school.
      // In a real system we'd have a dropdown for students. 
      // For this demo, we'll try to find a linked student if parent, else use profile.id if student.
      let studentId = profile.id;
      let parentId = null;

      if (profile.role === 'parent') {
        parentId = profile.id;
        const { data: links } = await supabase.from('parent_student_links').select('student_id').eq('parent_id', profile.id).limit(1);
        if (links && links.length > 0) {
          studentId = links[0].student_id;
        } else {
          throw new Error('No linked student found for parent account.');
        }
      }

      const { error } = await supabase.from('complaints').insert({
        school_id: profile.school_id,
        student_id: studentId,
        parent_id: parentId,
        subject: form.subject,
        description: form.description,
      });
      if (error) throw error;
      toast.success('Complaint submitted. We will review it soon.');
      setDialogOpen(false);
      setForm({ subject: '', description: '' });
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('complaints').update({
        status: 'resolved',
        admin_response: resolveForm.response,
      }).eq('id', resolveForm.id);
      if (error) throw error;
      toast.success('Complaint resolved');
      setResolveForm({ id: '', response: '' });
      fetchComplaints();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Complaints & Concerns"
        description={isAdmin ? "Manage and resolve issues raised by students and parents." : "Raise an issue or track the status of your concerns."}
        action={isParentOrStudent && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Raise Concern</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit a Concern</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="Issue with classroom facilities" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required placeholder="Tell us more about your concern..." rows={4} />
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
        <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No complaints" description="Everything seems to be running smoothly!" />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-card rounded-xl shadow-card overflow-hidden border border-border">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{c.subject}</h3>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        c.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {c.status === 'resolved' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Submitted by <span className="font-medium text-foreground">{c.profiles?.full_name || 'Anonymous'}</span> • {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground bg-subtle/30 p-4 rounded-lg italic leading-relaxed">"{c.description}"</p>
              </div>

              {c.status === 'resolved' ? (
                <div className="px-6 py-4 bg-primary/5 border-t border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Send className="h-3 w-3" /> Admin Response
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">{c.admin_response}</p>
                </div>
              ) : isAdmin ? (
                <div className="px-6 py-4 bg-muted/20 border-t border-border">
                  <form onSubmit={handleResolve} className="flex gap-3">
                    <Input 
                      placeholder="Add a response to resolve..." 
                      className="flex-1"
                      value={resolveForm.id === c.id ? resolveForm.response : ''}
                      onChange={e => setResolveForm({ id: c.id, response: e.target.value })}
                      required
                    />
                    <Button type="submit" size="sm" onClick={() => setResolveForm(f => ({ ...f, id: c.id }))}>Resolve</Button>
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
