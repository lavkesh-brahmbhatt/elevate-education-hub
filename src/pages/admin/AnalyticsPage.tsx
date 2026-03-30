import { useEffect, useState } from 'react';
import api from '@/services/api';
import { PageHeader, StatCard } from '@/components/DashboardWidgets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, UserCheck, Bell } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, classCount: 0, noticeCount: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/stats').then(({ data }) => {
      setStats(data.stats);
      setChartData(data.chartData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading school insights...</div>;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Analytics" description="Visualize and analyze your school's performance metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.studentCount.toString()} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Faculty" value={stats.teacherCount.toString()} icon={<UserCheck className="h-4 w-4" />} />
        <StatCard label="Classes" value={stats.classCount.toString()} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Active Notices" value={stats.noticeCount.toString()} icon={<Bell className="h-4 w-4" />} />
      </div>

      <div className="bg-card rounded-xl shadow-card p-6 h-[400px]">
        <h3 className="text-sm font-medium mb-6">Student Enrollment Per Class</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
            <YAxis fontSize={12} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
