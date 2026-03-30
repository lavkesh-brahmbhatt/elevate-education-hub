import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, StatCard } from '@/components/DashboardWidgets';
import { Calendar, Award, Bell, FileText, ChevronRight } from 'lucide-react';

export default function ParentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/parent').then(({ data }) => {
      setStats(data.stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading family profile...</div>;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Hello, ${profile?.full_name?.split(' ')[0] || 'Parent'}!`} 
        description="Here's a quick overview of your child's academic activities." 
      />
      
      {!stats ? (
        <div className="bg-card rounded-xl shadow-card p-6 border-2 border-dashed border-border/50">
          <p className="text-sm text-center text-muted-foreground">
            No student account is currently linked to your profile. Please contact the school office.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Attendance" value={stats.attendanceRate} icon={<Calendar className="h-4 w-4" />} />
            <StatCard label="Latest Score" value={stats.latestMark} icon={<Award className="h-4 w-4" />} />
            <StatCard label="Notices" value={stats.noticeCount} icon={<Bell className="h-4 w-4" />} />
            <StatCard label="Assignments" value={stats.assignmentCount} icon={<FileText className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/child-attendance" className="p-3 bg-subtle/30 hover:bg-subtle/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> View Attendance
                </Link>
                <Link to="/dashboard/child-marks" className="p-3 bg-subtle/30 hover:bg-subtle/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" /> Performance
                </Link>
                <Link to="/dashboard/notices" className="p-3 bg-subtle/30 hover:bg-subtle/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notice Board
                </Link>
                <Link to="/dashboard/child-assignments" className="p-3 bg-subtle/30 hover:bg-subtle/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Lessons
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
