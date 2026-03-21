import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Calendar, Trash2, PlusCircle, Share2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";



export default function NoticePage() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.data);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchNotices();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);

    try {
        await api.post('/notices', { title, description });
        toast.success('Notice published successfully');
        setTitle("");
        setDescription("");
        setIsDialogOpen(false);
        fetchNotices();
    } catch (err) {
        toast.error('Failed to publish notice');
    } finally {
        setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Notice deleted');
      fetchNotices();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-3xl backdrop-blur-sm shadow-sm border border-slate-200/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">School Notice Board</h1>
          <p className="text-slate-500 mt-1">Stay updated with the latest announcements.</p>
        </div>

        {isAdminOrTeacher && (
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 transform active:scale-95">
                  <PlusCircle className="h-4 w-4" />
                  Publish Notice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">New Announcement</DialogTitle>
                  <DialogDescription>Your message will be sent to all students and parents.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <Input 
                    placeholder="Notice Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                  <Textarea 
                    placeholder="Describe the announcement..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-200"
                    required
                  />
                  <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                    {submitting ? "Publishing..." : "Publish Notice"}
                  </Button>
                </form>
              </DialogContent>
           </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : notices.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No notices posted</h3>
          <p className="text-slate-500">New announcements will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map(n => (
            <div key={n._id} className="group relative bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                   <Megaphone className="h-6 w-6" />
                 </div>
                 {isAdminOrTeacher && (
                    <button 
                      onClick={() => handleDelete(n._id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                 )}
               </div>

               <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-2 leading-tight">{n.title}</h3>
               <p className="text-sm text-slate-500 line-clamp-3 mb-6 leading-relaxed">{n.description}</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-1.5">
                     <Calendar className="h-3.5 w-3.5" />
                     <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className={`px-2 py-0.5 rounded-lg ${n.role === 'ADMIN' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {n.role}
                     </span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
