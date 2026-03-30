import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Upload, FileText, Download, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const UPLOADS_BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:5000';

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
  const { profile } = useAuth(); // Profile has lowercase role 'admin' | 'teacher' etc
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
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchMaterials();
    }
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

      toast.success('Material uploaded successfully!');
      setIsDialogOpen(false);
      setTitle("");
      setClassName("");
      setSubject("");
      setFile(null);
      fetchMaterials();
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const canUpload = profile?.role === 'admin' || profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl backdrop-blur-sm shadow-sm border border-slate-200/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Study Materials</h1>
          <p className="text-slate-500 mt-1">Access notes and resources uploaded by teachers.</p>
        </div>

        {canUpload && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Upload Study Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g., Ch 1 Notes" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="E.g., Maths" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="className">Class</Label>
                    <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="E.g., 10A" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-slate-400">{file ? file.name : "PDF, DOCX, Images, etc."}</p>
                    </div>
                    <input id="file" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
                <Button type="submit" disabled={uploading} className="w-full h-12 rounded-xl mt-2">
                  {uploading ? "Uploading..." : "Upload Material"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : materials.length === 0 ? (
        <EmptyState 
           icon={<FileText className="h-12 w-12 text-slate-300" />} 
           title="No study materials" 
           description="Materials uploaded by teachers will appear here." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(m => (
            <div key={m._id} className="group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-200/50 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    <a 
                      href={`${UPLOADS_BASE_URL}${m.fileUrl}`} 
                      download 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-primary transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    { (profile?.role === 'admin' || profile?.id === m.uploadedBy) && (
                      <button 
                        onClick={() => handleDelete(m._id)}
                        className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
               </div>
               
               <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-1">{m.title}</h3>
               <div className="flex gap-2 flex-wrap mb-4">
                  {m.subject && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{m.subject}</span>}
                  {m.className && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-purple-50 text-purple-600 rounded-lg">Class {m.className}</span>}
               </div>

               <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                  <span>{m.role === 'ADMIN' ? 'School Admin' : 'Teacher'}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
