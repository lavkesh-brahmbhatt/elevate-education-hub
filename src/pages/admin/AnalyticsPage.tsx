import { PageHeader, StatCard } from '@/components/DashboardWidgets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Users, BookOpen } from 'lucide-react';

const data = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 300 },
  { name: 'Mar', students: 200 },
  { name: 'Apr', students: 278 },
  { name: 'May', students: 189 },
  { name: 'Jun', students: 239 },
];

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Analytics" description="Visualize and analyze your school's performance metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Growth" value="+12%" />
        <StatCard label="Efficiency" value="85%" />
        <StatCard label="Active Users" value="24" />
        <StatCard label="Modules" value="8" />
      </div>

      <div className="bg-card rounded-xl shadow-card p-6 h-[400px]">
        <h3 className="text-sm font-medium mb-6">Student Enrollment Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
            <YAxis fontSize={12} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
