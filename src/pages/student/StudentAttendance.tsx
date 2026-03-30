import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState, StatCard } from '@/components/DashboardWidgets';
import { Calendar, Check, X, Clock, AlertCircle, Smile, Frown, Percent } from 'lucide-react';

type AttendanceRecord = { _id: string; date: string; status: string; classId: any };

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

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const attendancePercentage = records.length > 0 ? (presentCount / records.length * 100).toFixed(1) : '0';

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
      
      {records.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Presence" value={presentCount} icon={<Smile className="h-4 w-4" />} />
          <StatCard label="Total Absence" value={absentCount} icon={<Frown className="h-4 w-4" />} />
          <StatCard label="Attendance Rate" value={`${attendancePercentage}%`} icon={<Percent className="h-4 w-4" />} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : records.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No attendance records" description="Your attendance will appear here once marked by your teacher." />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="label-text py-3.5 px-6 font-semibold">Date</th>
                <th className="label-text py-3.5 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-border last:border-0 hover:bg-subtle/30 transition-colors">
                  <td className="py-4 px-6 text-sm tabular-nums font-medium">
                    {new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full p-1 bg-subtle/20">{statusIcon(r.status)}</div>
                      <span className="text-sm capitalize font-medium">{r.status}</span>
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
