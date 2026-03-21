import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';

type AttendanceRecord = { date: string; status: string; classId: any };

export default function StudentAttendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    api.get('/attendance').then(({ data }) => {
      setRecords((data as AttendanceRecord[]) || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
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
      <PageHeader title="My Attendance" description="View your attendance records." />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No attendance records" description="Your attendance will appear here once marked by your teacher." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text py-3 px-4">Date</th>
                <th className="label-text py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors">
                  <td className="py-3 px-4 text-sm tabular-nums">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {statusIcon(r.status)}
                      <span className="text-sm capitalize">{r.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
