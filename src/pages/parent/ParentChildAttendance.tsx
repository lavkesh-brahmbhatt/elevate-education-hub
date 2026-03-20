import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';

type AttendanceRecord = { date: string; status: string; class_id: string };

export default function ParentChildAttendance() {
  const { profile } = useAuth();
  const [childName, setChildName] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      // Get linked student
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', profile.id)
        .limit(1);

      if (links && links.length > 0) {
        setChildName(links[0].profiles?.full_name || 'Child');
        const studentId = links[0].student_id;
        
        const { data } = await supabase
            .from('attendance')
            .select('date, status, class_id')
            .eq('student_id', studentId)
            .order('date', { ascending: false });
            
        setRecords((data as AttendanceRecord[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, [profile]);

  const statusIcon = (s: string) => {
    switch (s) {
      case 'present': return <Check className="h-4 w-4 text-success" />;
      case 'absent': return <X className="h-4 w-4 text-destructive" />;
      case 'late': return <Clock className="h-4 w-4 text-warning" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${childName}'s Attendance`} description={`View attendance history for ${childName}.`} />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : !childName ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No student linked" description="Please contact administrator to link your child." />
      ) : records.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No records found" description={`No attendance has been marked for ${childName} yet.`} />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-border">
              <th className="label-text py-3 px-4">Date</th>
              <th className="label-text py-3 px-4">Status</th>
            </tr></thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-subtle/30 transition-colors">
                  <td className="py-3 px-4 text-sm tabular-nums">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4"><div className="flex items-center gap-2">{statusIcon(r.status)}<span className="text-sm capitalize">{r.status}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
