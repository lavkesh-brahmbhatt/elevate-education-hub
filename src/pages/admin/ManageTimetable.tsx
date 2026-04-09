import { useState } from 'react';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar, Plus, Trash2, Save, Clock, BookOpen, User } from 'lucide-react';
import { useClasses, useSubjects, useTeachers, useTimetable, useCreateMutation } from '@/hooks/useApi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManageTimetable() {
  const { data: classes = [] } = useClasses();
  const { data: subjects = [] } = useSubjects();
  const { data: teachers = [] } = useTeachers();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  
  const { data: timetable = [], refetch } = useTimetable(selectedClass);
  const upsertTimetable = useCreateMutation('/timetable', ['timetable', selectedClass]);

  const currentDayData = timetable.find((t: any) => t.day === selectedDay) || { slots: [] };
  const [slots, setSlots] = useState<any[]>([]);

  // Update local slots when day/class changes
  useState(() => {
    if (currentDayData) setSlots(currentDayData.slots);
  });

  // Since I can't easily use useEffect with refetch here without loops, 
  // I'll just use a local state that updates when "Load" or "Day" is clicked.
  const handleLoad = () => {
    const dayData = timetable.find((t: any) => t.day === selectedDay);
    setSlots(dayData?.slots || []);
  };

  const addSlot = () => {
    setSlots([...slots, { startTime: '', endTime: '', subjectId: '', teacherId: '', roomNo: '' }]);
  };

  const removeSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const updateSlot = (idx: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[idx] = { ...newSlots[idx], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    if (!selectedClass) return toast.error('Select a class first');
    try {
      await upsertTimetable.mutateAsync({
        classId: selectedClass,
        day: selectedDay,
        slots
      });
      toast.success(`Timetable for ${selectedDay} updated`);
      refetch();
    } catch (err) {
      toast.error('Failed to save timetable');
    }
  };

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="Timetable Management"
        description="Schedule weekly classes, assign teachers to subjects, and manage classroom availability."
        icon={<Calendar size={28} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium p-6 space-y-4 h-fit">
           <div className="space-y-1.5">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                 <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Choose Class" /></SelectTrigger>
                 <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
           </div>
           <div className="space-y-1.5">
              <Label>Select Day</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                 <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Choose Day" /></SelectTrigger>
                 <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
           </div>
           <Button onClick={handleLoad} variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">Load schedule</Button>
        </div>

        <div className="md:col-span-3 space-y-6">
           {!selectedClass ? (
             <EmptyState icon={<Calendar className="h-10 w-10 text-slate-300" />} title="No Class Selected" description="Select a class from the sidebar to manage its weekly schedule." />
           ) : (
             <div className="card-premium p-8 bg-white/70 backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-xl font-black text-slate-800">{selectedDay} Schedule</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Editing {classes.find(c => c._id === selectedClass)?.name}</p>
                   </div>
                   <Button onClick={addSlot} size="sm" className="h-10 rounded-xl bg-indigo-50 text-primary hover:bg-primary hover:text-white transition-all font-black px-4">
                      <Plus size={16} className="mr-2" /> Add Slot
                   </Button>
                </div>

                <div className="space-y-4">
                   {slots.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                         <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No slots scheduled for this day.</p>
                      </div>
                   ) : (
                      slots.map((slot, idx) => (
                         <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 relative group animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="md:col-span-1 space-y-1.5">
                               <Label className="text-[9px] font-black uppercase">Start</Label>
                               <Input type="time" value={slot.startTime} onChange={e => updateSlot(idx, 'startTime', e.target.value)} className="h-10 rounded-lg" />
                            </div>
                            <div className="md:col-span-1 space-y-1.5">
                               <Label className="text-[9px] font-black uppercase">End</Label>
                               <Input type="time" value={slot.endTime} onChange={e => updateSlot(idx, 'endTime', e.target.value)} className="h-10 rounded-lg" />
                            </div>
                            <div className="md:col-span-1.5 space-y-1.5">
                               <Label className="text-[9px] font-black uppercase">Subject</Label>
                               <Select value={slot.subjectId?._id || slot.subjectId} onValueChange={v => updateSlot(idx, 'subjectId', v)}>
                                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sub" /></SelectTrigger>
                                  <SelectContent>{subjects.filter(s => (s.classId?._id || s.classId) === selectedClass).map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                               </Select>
                            </div>
                            <div className="md:col-span-1.5 space-y-1.5">
                               <Label className="text-[9px] font-black uppercase">Teacher</Label>
                               <Select value={slot.teacherId?._id || slot.teacherId} onValueChange={v => updateSlot(idx, 'teacherId', v)}>
                                  <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Tea" /></SelectTrigger>
                                  <SelectContent>{teachers.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent>
                               </Select>
                            </div>
                            <div className="md:col-span-0.5 space-y-1.5">
                               <Label className="text-[9px] font-black uppercase">Room</Label>
                               <Input value={slot.roomNo} onChange={e => updateSlot(idx, 'roomNo', e.target.value)} placeholder="101" className="h-10 rounded-lg" />
                            </div>
                            <div className="flex items-end pb-1 justify-end">
                               <Button variant="ghost" size="icon" onClick={() => removeSlot(idx)} className="h-10 w-10 rounded-xl text-rose-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></Button>
                            </div>
                         </div>
                      ))
                   )}
                </div>

                {slots.length > 0 && (
                   <div className="mt-10 flex justify-end">
                      <Button onClick={handleSave} className="h-14 px-8 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow font-black uppercase tracking-widest text-xs transition-all active:scale-95">
                         <Save size={18} className="mr-2" strokeWidth={3} /> Save Schedule
                      </Button>
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
