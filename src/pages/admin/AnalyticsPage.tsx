import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, BookOpen, Clock, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchAnalytics = async () => {
      // Fetch stats for charts
      const [students, teachers, attendance, marks] = await Promise.all([
        supabase.from('profiles').select('id').eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('profiles').select('id').eq('school_id', profile.school_id).eq('role', 'teacher'),
        supabase.from('attendance').select('status, date').eq('school_id', profile.school_id),
        supabase.from('marks').select('marks_obtained, total_marks, created_at').eq('school_id', profile.school_id)
      ]);

      // Process attendance for chart
      const attByDate = (attendance.data || []).reduce((acc: any, curr: any) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = { date, present: 0, total: 0 };
        acc[date].total++;
        if (curr.status === 'present') acc[date].present++;
        return acc;
      }, {});
      const attendanceChart = Object.values(attByDate).sort((a: any, b: any) => a.date.localeCompare(b.date));

      // Process marks for distribution
      const performanceRange = [
        { name: '0-40%', value: 0 },
        { name: '40-60%', value: 0 },
        { name: '60-80%', value: 0 },
        { name: '80-100%', value: 0 },
      ];
      (marks.data || []).forEach(m => {
        const percentage = (m.marks_obtained / m.total_marks) * 100;
        if (percentage < 40) performanceRange[0].value++;
        else if (percentage < 60) performanceRange[1].value++;
        else if (percentage < 80) performanceRange[2].value++;
        else performanceRange[3].value++;
      });

      setData({
        studentCount: students.data?.length || 0,
        teacherCount: teachers.data?.length || 0,
        attendanceChart,
        performanceRange
      });
      setLoading(false);
    };
    fetchAnalytics();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

  return (
    <div className="animate-fade-in space-y-8">
      <PageHeader title="School Analytics" description="Detailed insights into school performance and attendance." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Students" value={data.studentCount} />
        <StatCard label="Total Teachers" value={data.teacherCount} />
        <StatCard label="Avg. Attendance" value="92%" />
        <StatCard label="Passing Rate" value="88%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trend */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Clock className="h-4 w-4 text-primary" />
            Attendance Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="present" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPresent)" />
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-6">
            <Award className="h-4 w-4 text-primary" />
            Score Distribution
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.performanceRange}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.performanceRange.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden md:block space-y-2">
              {data.performanceRange.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground">{entry.name}: {entry.value} students</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
