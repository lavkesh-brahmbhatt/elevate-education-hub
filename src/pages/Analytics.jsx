import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [classData, setClassData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [passFailData, setPassFailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true);
        const [sumRes, classRes, topRes, subRes, pfRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/class-performance'),
          api.get('/analytics/top-students'),
          api.get('/analytics/subject-performance'),
          api.get('/analytics/pass-fail')
        ]);

        setSummary(sumRes.data);
        setClassData(classRes.data);
        setTopStudents(topRes.data);
        setSubjectData(subRes.data);
        
        // Format pass/fail for PieChart
        setPassFailData([
          { name: 'Pass', value: pfRes.data.passCount },
          { name: 'Fail', value: pfRes.data.failCount }
        ]);

        setError(null);
      } catch (err) {
        console.error('Analytics Fetch Error:', err);
        setError('Failed to load real-time analytics. Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Calculating real-time academic insights...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-destructive bg-destructive/10 rounded-lg m-8">{error}</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Academic Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your school's performance metrics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Students" value={summary?.totalStudents} icon={<Users />} color="text-blue-500" />
        <SummaryCard title="Total Teachers" value={summary?.totalTeachers} icon={<BookOpen />} color="text-green-500" />
        <SummaryCard title="Total Classes" value={summary?.totalClasses} icon={<LayoutDashboard />} color="text-purple-500" />
        <SummaryCard title="Average Marks" value={`${summary?.averageMarks}%`} icon={<GraduationCap />} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Performance Chart */}
        <ChartCard title="Class-wise Average Marks (Performance)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageMarks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Performing Students */}
        <ChartCard title="Top 5 Performing Students">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStudents} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="studentName" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="averageMarks" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Subject-wise Distribution */}
        <ChartCard title="Subject Performance Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subjectData}
                dataKey="averageMarks"
                nameKey="subjectName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pass vs Fail Ratio */}
        <ChartCard title="Success Ratio (Pass vs Fail)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={passFailData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                label
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${color} opacity-80 animate-in zoom-in`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
