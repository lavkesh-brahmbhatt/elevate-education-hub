import { useState, useEffect } from 'react';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, User, MapPin } from 'lucide-react';
import { useClasses, useTimetable } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ViewTimetable() {
  const { profile } = useAuth();
  const { data: classes = [] } = useClasses();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() - 1] || DAYS[0]);
  
  const { data: timetable = [], isLoading: loading } = useTimetable(selectedClass);

  useEffect(() => {
    if (profile?.role === 'student') {
        api.get('/students/me').then(({ data }) => setSelectedClass(data.classId)).catch(() => {});
    } else if (classes.length > 0) {
        setSelectedClass(classes[0]._id);
    }
  }, [profile, classes]);

  const currentDaySlots = timetable.find((t: any) => t.day === selectedDay)?.slots || [];

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="School Timetable"
        description="View weekly class schedules, subject allocations, and classroom locations."
        icon={<Calendar size={28} />}
      />

      <div className="flex flex-col md:flex-row gap-6">
         {profile?.role !== 'student' && (
           <div className="w-full md:w-64 space-y-4">
              <div className="card-premium p-6 bg-white/70 backdrop-blur-md">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Selected Class</p>
                 <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choose Class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                 </Select>
              </div>
           </div>
         )}

         <div className="flex-1 space-y-6">
            {/* Days Toggle */}
            <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-100/50 backdrop-blur-sm border border-slate-100">
               {DAYS.map(d => (
                  <Button 
                    key={d} 
                    variant={selectedDay === d ? "default" : "ghost"}
                    className={`h-10 rounded-xl font-black uppercase text-[10px] transition-all px-4 ${selectedDay === d ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}
                    onClick={() => setSelectedDay(d)}
                  >
                    {d.substring(0, 3)}
                  </Button>
               ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : !selectedClass ? (
                <EmptyState 
                  icon={<Calendar className="h-10 w-10 text-slate-200" />}
                  title="Loading class data..." 
                  description="Please wait while we fetch the class details."
                />
            ) : currentDaySlots.length === 0 ? (
                <EmptyState icon={<Calendar className="h-10 w-10 text-slate-300" />} title="No Classes Scheduled" description={`There are no classes scheduled for ${selectedDay}.`} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {currentDaySlots.map((slot: any, idx: number) => (
                      <div key={idx} className="card-premium p-8 bg-white border-none group hover:scale-[1.03] transition-all duration-500 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-primary transition-colors" />
                         
                         <div className="flex items-center justify-between mb-8">
                            <span className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={12} className="group-hover:text-primary transition-colors" /> {slot.startTime} - {slot.endTime}
                            </span>
                            {slot.roomNo && (
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                                    <MapPin size={12} /> {slot.roomNo}
                                </span>
                            )}
                         </div>

                         <h4 className="text-xl font-black text-slate-800 mb-2 leading-tight">{slot.subjectId?.name || 'Subject'}</h4>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors mb-6">
                             <User size={12} strokeWidth={3} /> {slot.teacherId?.name || 'Assigned teacher'}
                         </div>

                         <div className="pt-4 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-black uppercase text-primary/50">Next session: Tomorrow</span>
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><BookOpen size={10} /></div>
                         </div>
                      </div>
                   ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );
}
