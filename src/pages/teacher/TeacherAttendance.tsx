import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';

type Student = { _id: string; name: string };
type ClassItem = { _id: string; name: string; section: string | null };

export default function TeacherAttendance() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!profile) return;
    // Fetch classes for this teacher (or all for now in this demo)
    api.get('/classes').then(({ data }) => {
      setClasses(data || []);
    });
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchData = async () => {
      try {
        // Fetch students for this class
        const studentRes = await api.get(`/students?classId=${selectedClass}`);
        setStudents(studentRes.data || []);

        // Fetch existing attendance
        const attendanceRes = await api.get(`/attendance?date=${date}&classId=${selectedClass}`);
        const attMap: Record<string, string> = {};
        attendanceRes.data.forEach((a: any) => {
          attMap[a.studentId._id || a.studentId] = a.status;
        });
        setAttendance(attMap);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, [selectedClass, date]);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
      const statuses = ['present', 'absent', 'late', 'excused'];
      const current = prev[studentId] || 'present';
      const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
      return { ...prev, [studentId]: next };
    });
  };

  const saveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        classId: selectedClass,
        studentId: s._id,
        date,
        status: attendance[s._id] || 'present',
      }));

      await api.post('/attendance/bulk', { records });
      toast.success('Attendance saved successfully');
    } catch (err: any) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4 text-success" />;
      case 'absent': return <X className="h-4 w-4 text-destructive" />;
      case 'late': return <Clock className="h-4 w-4 text-warning" />;
      case 'excused': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Attendance" description="Mark or update attendance for your students." />
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 max-w-xs space-y-2">
          <Label className="label-text">Select Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-xs space-y-2">
          <Label className="label-text">Select Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {!selectedClass ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="Select a class" description="Choose a class to mark attendance." />
      ) : students.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No students found" description="No students found for this class." />
      ) : (
        <>
          <div className="bg-card rounded-xl shadow-card overflow-hidden mb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-text py-3 px-4">Student</th>
                  <th className="label-text py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const status = attendance[s._id] || 'present';
                  return (
                    <tr key={s._id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors cursor-pointer" onClick={() => toggleStatus(s._id)}>
                      <td className="py-3 px-4 text-sm font-medium">{s.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {statusIcon(status)}
                          <span className="text-sm capitalize">{status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button onClick={saveAttendance} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </>
      )}
    </div>
  );
}
