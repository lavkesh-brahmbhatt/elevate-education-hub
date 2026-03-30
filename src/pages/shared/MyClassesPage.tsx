import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { BookOpen, GraduationCap, Users } from 'lucide-react';

type ClassItem = { _id: string; name: string; section: string | null; grade?: string };

export default function MyClassesPage() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchClasses = async () => {
      try {
        const { data } = await api.get('/classes');
        setClasses((data as ClassItem[]) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [profile]);

  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={isTeacher ? 'My Classes' : 'My Class'}
        description={isTeacher
          ? 'Classes you are currently teaching this semester.'
          : 'Your enrolled class and section details.'}
      />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title={isTeacher ? 'No classes assigned' : 'Not enrolled in a class'}
          description={isTeacher
            ? 'Contact the admin to be assigned to subjects and classes.'
            : 'Contact the admin to be assigned to a class.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(c => (
            <div key={c._id} className="bg-card rounded-xl shadow-card p-6 border border-border transition-all hover:shadow-lg group">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">{c.name}</h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{c.section ? `Section ${c.section}` : 'Standard Program'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
