import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { BookOpen, GraduationCap } from 'lucide-react';

type ClassItem = { _id: string; name: string; section: string | null };

export default function MyClassesPage() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      try {
        const { data } = await api.get('/classes');
        // Simple filtering for Demo: 
        // If teacher, they'd want classes they are assigned to via subjects
        // If student, they'd want their own class
        // For now, we'll show all classes in the school as "Available Classes" 
        // until we have more robust enrollment data in MongoDB
        setClasses((data as ClassItem[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="School Classes" 
        description={profile?.role === 'teacher' ? 'Active classes in the institution.' : 'View institution classroom details.'} 
      />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : classes.length === 0 ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No classes" description="Institution has not set up any classes yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c._id} className="bg-card rounded-xl shadow-card p-6 border border-border transition-all hover:shadow-lg group">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {c.section ? `Section ${c.section}` : 'Standard Program'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
