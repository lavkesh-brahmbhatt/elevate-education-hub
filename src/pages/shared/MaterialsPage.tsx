import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Upload, FileText, Download, Trash2, Plus, Library, BookOpen, Clock, FileCode, FileImage, FileType } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// No base URL needed for Cloudinary full URLs

type Material = { 
  _id: string; 
  title: string; 
  fileUrl: string; 
  uploadedBy: string; 
  role: string;
  className?: string;
  subject?: string;
  createdAt: string;
};

export default function MaterialsPage() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials');
      setMaterials(response.data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) fetchMaterials();
  }, [profile]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !profile) {
      toast.error('Please provide title and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('className', className);
    formData.append('subject', subject);

    try {
      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Resource published successfully');
      setIsDialogOpen(false);
      setTitle("");
      setClassName("");
      setSubject("");
      setFile(null);
      fetchMaterials();
    } catch (err: any) {
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Resource removed');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'svg'].includes(ext!)) return <FileImage className="text-rose-500" />;
    if (['pdf', 'doc', 'docx'].includes(ext!)) return <FileText className="text-indigo-500" />;
    if (['zip', 'rar'].includes(ext!)) return <FileType className="text-amber-500" />;
    return <FileCode className="text-slate-500" />;
  };

  const canUpload = profile?.role === 'admin' || profile?.role === 'teacher';

  return (
    <div className="stagger">
      <PageHeader 
        title="Resource Library" 
        description="Explore educational materials, textbooks, and class notes shared by your faculty."
        icon={<Library size={28} />}
        action={canUpload && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Upload size={100}/></div>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white">Share Resource</DialogTitle>
                  <p className="text-indigo-100/70 text-sm font-medium">Make academic materials available to your students.</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleUpload} className="p-8 space-y-5 bg-white">
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">Resource Title</Label>
                  <Input 
                    value={title} onChange={e => setTitle(e.target.value)} 
                    className="h-12 rounded-xl focus:ring-primary/10 border-slate-200"
                    placeholder="e.g. Calculus Chapter 1 Notes"
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Subject</Label>
                    <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Maths" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Target Class</Label>
                    <Input value={className} onChange={e => setClassName(e.target.value)} placeholder="10A" className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <Label className="label-text group-focus-within:text-primary">File Asset</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50/50 hover:border-primary/40 transition-all duration-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-slate-300 group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary">
                        {file ? file.name : "Select Document"}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
                <Button type="submit" disabled={uploading} className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4">
                  {uploading ? "Uploading Asset..." : "Publish Resource"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Assets...</p>
        </div>
      ) : materials.length === 0 ? (
        <EmptyState 
           icon={<BookOpen className="h-10 w-10 text-slate-300" />} 
           title="Library is Empty" 
           description="No resources have been shared yet. Faculty can upload documents to appearing here." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials.map(m => (
            <div key={m._id} className="card-premium group relative bg-white/70 backdrop-blur-md border-none flex flex-col items-center p-8 text-center hover:scale-[1.02] transition-all duration-500">
               <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                 { (profile?.role === 'admin' || profile?.id === m.uploadedBy) && (
                    <button onClick={() => handleDelete(m._id)} className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                       <Trash2 size={14} />
                    </button>
                 )}
               </div>

               <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-6 shadow-inner group-hover:bg-primary/5 transition-all duration-500 group-hover:rotate-[10deg]">
                  <div className="scale-[2]">
                    {getFileIcon(m.fileUrl)}
                  </div>
               </div>
               
               <h3 className="font-black text-slate-800 text-base mb-1 line-clamp-1 h-6">{m.title}</h3>
               <div className="flex items-center gap-2 mb-6">
                  {m.subject && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-md">/ {m.subject}</span>}
                  {m.className && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-indigo-50 text-primary rounded-md">Class {m.className}</span>}
               </div>

               <div className="w-full flex items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
                 <a 
                   href={m.fileUrl} 
                   download target="_blank" rel="noreferrer"
                   className="flex-1 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-black/10"
                 >
                   <Download size={14} /> Download
                 </a>
               </div>
               
               <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                  <Clock size={10} /> 
                  {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
