import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { StatCard, PageHeader } from '@/components/DashboardWidgets';
import { Users, BookOpen, ClipboardList, PlusCircle, CheckCircle, Bell, History } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, classCount: 0, noticeCount: 0 });
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/activity')
        ]);
        setStats(statsRes.data.stats);
        setActivities(activityRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description={`Welcome back, ${profile?.full_name || 'Admin'}. Here's what's happening.`} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.studentCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Total Teachers" value={stats.teacherCount} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Classes" value={stats.classCount} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard label="Active Notices" value={stats.noticeCount} icon={<Bell className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-card p-6 lg:col-span-1">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-primary" /> Quick Actions
          </h3>
          <div className="space-y-2">
            <QuickAction icon={<Users className="h-4 w-4" />} label="Manage Teachers" onClick={() => navigate('/dashboard/teachers')} />
            <QuickAction icon={<Users className="h-4 w-4" />} label="Manage Students" onClick={() => navigate('/dashboard/students')} />
            <QuickAction icon={<BookOpen className="h-4 w-4" />} label="Manage Classes" onClick={() => navigate('/dashboard/classes')} />
            <QuickAction icon={<ClipboardList className="h-4 w-4" />} label="Academic Subjects" onClick={() => navigate('/dashboard/subjects')} />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 lg:col-span-2">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Recent Activity
          </h3>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center italic">No recent activity logged yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((a, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-subtle/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    {a.action.includes('CREATED') ? <PlusCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{a.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{a.performedBy}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
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

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-subtle transition-all text-sm w-full text-left group"
    >
      <div className="h-9 w-9 rounded-xl bg-subtle/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}
