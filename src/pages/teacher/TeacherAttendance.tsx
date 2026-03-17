import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Check, X, Clock, AlertCircle } from 'lucide-react';

type Student = { id: string; full_name: string };
type ClassItem = { id: string; name: string; section: string | null };

export default function TeacherAttendance() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!profile) return;
    supabase.from('subjects').select('class_id').eq('teacher_id', profile.id).then(({ data }) => {
      const classIds = [...new Set((data || []).map(s => s.class_id))];
      if (classIds.length > 0) {
        supabase.from('classes').select('id, name, section').in('id', classIds).then(({ data }) => {
          setClasses((data as ClassItem[]) || []);
        });
      }
    });
  }, [profile]);

  useEffect(() => {
    if (!selectedClass || !profile) return;
    const fetchStudents = async () => {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', selectedClass);
      if (!enrollments?.length) { setStudents([]); return; }
      const studentIds = enrollments.map(e => e.student_id);
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', studentIds);
      setStudents((profiles as Student[]) || []);

      // Load existing attendance
      const { data: existing } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('class_id', selectedClass)
        .eq('date', date);
      const att: Record<string, string> = {};
      (existing || []).forEach(a => { att[a.student_id] = a.status; });
      setAttendance(att);
    };
    fetchStudents();
  }, [selectedClass, profile, date]);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => {
      const statuses = ['present', 'absent', 'late', 'excused'];
      const current = prev[studentId] || 'present';
      const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
      return { ...prev, [studentId]: next };
    });
  };

  const saveAttendance = async () => {
    if (!profile || !selectedClass) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        school_id: profile.school_id,
        class_id: selectedClass,
        student_id: s.id,
        date,
        status: attendance[s.id] || 'present',
        marked_by: profile.id,
      }));

      const { error } = await supabase.from('attendance').upsert(records, {
        onConflict: 'class_id,student_id,date',
      });
      if (error) throw error;
      toast.success('Attendance saved');
    } catch (err: any) {
      toast.error(err.message);
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
      <PageHeader title="Attendance" description={`Mark attendance for ${date}`} />

      <div className="mb-6 max-w-xs">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
          <SelectContent>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedClass ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="Select a class" description="Choose a class to mark attendance." />
      ) : students.length === 0 ? (
        <EmptyState icon={<Calendar className="h-6 w-6" />} title="No students enrolled" description="No students are enrolled in this class." />
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
                  const status = attendance[s.id] || 'present';
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-subtle/50 transition-colors cursor-pointer" onClick={() => toggleStatus(s.id)}>
                      <td className="py-3 px-4 text-sm font-medium">{s.full_name}</td>
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
