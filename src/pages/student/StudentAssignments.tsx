import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { FileText, Calendar, Clock, AlertCircle } from 'lucide-react';

type Assignment = { _id: string; title: string; dueDate: string; classId: { name: string }; subjectId: { name: string } };

export default function StudentAssignments() {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    api.get('/assignments').then(({ data }) => {
      setAssignments((data as Assignment[]) || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Assignments" description="View and track your upcoming assignments." />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState 
            icon={<FileText className="h-6 w-6" />} 
            title="No assignments" 
            description="Good job! You've caught up with all your current assignments." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(a => {
            const isLate = new Date() > new Date(a.dueDate);
            return (
              <div key={a._id} className="bg-card rounded-xl shadow-card p-6 border border-border transition-all hover:shadow-lg group">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${isLate ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {isLate ? 'Past Due' : 'Active'}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1">{a.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {a.subjectId?.name} · {a.classId?.name}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-warning">
                  <Calendar className="h-3.5 w-3.5" />
                  Due {new Date(a.dueDate).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
