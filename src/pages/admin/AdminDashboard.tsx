import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { Users, BookOpen, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, subjects: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats({
          students: data.students || 0,
          teachers: data.teachers || 0,
          classes: data.classes || 0,
          subjects: data.subjects || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="School overview and quick actions." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.students} />
        <StatCard label="Total Teachers" value={stats.teachers} />
        <StatCard label="Classes" value={stats.classes} />
        <StatCard label="Subjects" value={stats.subjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-card p-6">
          <h3 className="text-sm font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <QuickAction icon={<Users className="h-4 w-4" strokeWidth={1.5} />} label="Add Teacher" onClick={() => navigate('/dashboard/teachers')} />
            <QuickAction icon={<Users className="h-4 w-4" strokeWidth={1.5} />} label="Add Student" onClick={() => navigate('/dashboard/students')} />
            <QuickAction icon={<BookOpen className="h-4 w-4" strokeWidth={1.5} />} label="Create Class" onClick={() => navigate('/dashboard/classes')} />
            <QuickAction icon={<ClipboardList className="h-4 w-4" strokeWidth={1.5} />} label="Add Subject" onClick={() => navigate('/dashboard/subjects')} />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6">
          <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Activity log will populate as users interact with the system.</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm w-full text-left"
    >
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
}
