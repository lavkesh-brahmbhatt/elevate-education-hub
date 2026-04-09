import { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Check, X, Clock, AlertCircle, Save, CheckCircle2, UserCheck, Search } from 'lucide-react';

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile) return;
    api.get('/classes').then(({ data }) => setClasses(data || []));
  }, [profile]);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchData = async () => {
      try {
        const [studentRes, attendanceRes] = await Promise.all([
          api.get(`/students?classId=${selectedClass}`),
          api.get(`/attendance?date=${date}&classId=${selectedClass}`)
        ]);
        setStudents(studentRes.data || []);
        const attMap: Record<string, string> = {};
        attendanceRes.data.forEach((a: any) => {
          attMap[a.studentId._id || a.studentId] = a.status;
        });
        setAttendance(attMap);
      } catch (err) {
        toast.error('Failed to load class data');
      }
    };
    fetchData();
  }, [selectedClass, date]);

  const setStatus = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const newAtt = { ...attendance };
    students.forEach(s => { newAtt[s._id] = status; });
    setAttendance(newAtt);
    toast.info(`All students marked as ${status}`);
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
      toast.success('Attendance records synchronized successfully');
    } catch (err: any) {
      toast.error('Failed to sync attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="stagger">
      <PageHeader 
        title="Classroom Roll Call" 
        description="Mark daily attendance, track punctuality, and sync records with the main office."
        icon={<UserCheck size={28} />}
        action={
          <div className="flex gap-3">
             <Button 
               variant="outline" 
               className="h-12 px-6 rounded-2xl border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-600"
               onClick={() => markAll('present')}
               disabled={!selectedClass || students.length === 0}
             >
               Mark All Present
             </Button>
             <Button 
               className="h-12 px-8 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow font-black uppercase tracking-widest text-xs"
               onClick={saveAttendance}
               disabled={saving || !selectedClass || students.length === 0}
             >
               <Save className="h-4 w-4 mr-2" strokeWidth={3} /> {saving ? 'SYNCING...' : 'SAVE & SYNC'}
             </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card-premium p-6 bg-white flex flex-col gap-2">
          <Label className="label-text">Academic Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200">
              <SelectValue placeholder="Select a classroom" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {classes.map(c => (
                <SelectItem key={c._id} value={c._id}>{c.name}{c.section ? ` (${c.section})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="card-premium p-6 bg-white flex flex-col gap-2">
          <Label className="label-text">Select Log Date</Label>
          <div className="relative">
            <Input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-12 rounded-xl border-slate-200 pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>

        <div className="card-premium p-6 bg-primary/5 border-primary/10 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Completion Status</p>
            <p className="text-2xl font-black text-primary">
              {Object.keys(attendance).length}/{students.length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Students Marked</p>
        </div>
      </div>

      {!selectedClass ? (
        <EmptyState 
          icon={<Calendar className="h-10 w-10" />} 
          title="Classroom Not Selected" 
          description="Please choose a class from the dropdown above to begin marking attendance." 
        />
      ) : students.length === 0 ? (
        <EmptyState 
          icon={<AlertCircle className="h-10 w-10" />} 
          title="No Students Found" 
          description="This classroom doesn't have any students enrolled yet." 
        />
      ) : (
        <div className="card-premium overflow-hidden border-none bg-white/70 backdrop-blur-md">
          <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between gap-4">
             <div className="relative flex-1 max-w-sm">
                <Input 
                  placeholder="Filter students by name..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-10 pl-10 rounded-xl bg-slate-50 border-none focus:ring-primary/20"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">
                Click status icons to toggle individual attendance
             </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20">
                  <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100">Student Name</th>
                  <th className="py-4 px-8 font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 border-b border-slate-100 text-center">Status Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((s, idx) => {
                  const status = attendance[s._id] || 'present';
                  return (
                    <tr key={s._id} className="group hover:bg-white transition-all duration-300">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                           <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                              {s.name.charAt(0)}
                           </div>
                           <p className="text-sm font-black text-slate-800">{s.name}</p>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center justify-center gap-3">
                           <StatusButton 
                             active={status === 'present'} 
                             color="green" 
                             onClick={() => setStatus(s._id, 'present')}
                             icon={<Check size={16} strokeWidth={3} />}
                             label="Present"
                           />
                           <StatusButton 
                             active={status === 'late'} 
                             color="amber" 
                             onClick={() => setStatus(s._id, 'late')}
                             icon={<Clock size={16} strokeWidth={3} />}
                             label="Late"
                           />
                           <StatusButton 
                             active={status === 'absent'} 
                             color="rose" 
                             onClick={() => setStatus(s._id, 'absent')}
                             icon={<X size={16} strokeWidth={3} />}
                             label="Absent"
                           />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusButton({ active, color, onClick, icon, label }: { active: boolean; color: string; onClick: () => void; icon: any; label: string }) {
  const colorMap: any = {
    green: active ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-500',
    amber: active ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-500',
    rose: active ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-600'
  };

  return (
    <button
      onClick={onClick}
      className={`h-11 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${colorMap[color]} ${active ? 'shadow-lg scale-110' : 'scale-100 opacity-60 hover:opacity-100'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
