import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_BASE_URL = 'http://localhost:5000/api';

export default function ComplaintPage() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      const response = await axios.get(`${API_BASE_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId }
      });
      setComplaints(response.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchComplaints();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      await axios.post(`${API_BASE_URL}/complaints`, { message }, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId }
      });
      toast.success('Complaint submitted successfully');
      setMessage("");
      setIsDialogOpen(false);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const tenantId = localStorage.getItem('tenantId');
      await axios.put(`${API_BASE_URL}/complaints/${id}/resolve`, {}, {
        headers: { 'Authorization': `Bearer ${token}`, 'x-tenant-id': tenantId }
      });
      toast.success('Complaint marked as resolved');
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to resolve');
    }
  };

  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Complaints & Feedback</h1>
          <p className="text-slate-500 mt-1">Raise your concerns or view reported issues.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl px-6 bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Raise a Complaint</DialogTitle>
              <DialogDescription>Describe the issue you're facing. Our team will look into it.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <Textarea 
                placeholder="What is the issue?" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-200"
                required
              />
              <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-primary">
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No complaints found</h3>
          <p className="text-slate-500">Everything looks good so far!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map(c => (
            <Card key={c._id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                         c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                       }`}>
                         {c.status}
                       </span>
                       <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">•</span>
                       <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                         {new Date(c.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{c.message}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                       <span className="capitalize">{c.userRole}</span>
                    </div>
                  </div>

                  {isAdminOrTeacher && c.status === 'Pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleResolve(c._id)}
                      className="rounded-lg border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
