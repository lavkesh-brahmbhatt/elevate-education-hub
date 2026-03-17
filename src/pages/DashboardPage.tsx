import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import StudentDashboard from '@/pages/student/StudentDashboard';
import ParentDashboard from '@/pages/parent/ParentDashboard';

export default function DashboardPage() {
  const { profile } = useAuth();
  if (!profile) return null;

  const dashboardContent = () => {
    switch (profile.role) {
      case 'admin': return <AdminDashboard />;
      case 'teacher': return <TeacherDashboard />;
      case 'student': return <StudentDashboard />;
      case 'parent': return <ParentDashboard />;
      default: return <AdminDashboard />;
    }
  };

  return <DashboardLayout>{dashboardContent()}</DashboardLayout>;
}
