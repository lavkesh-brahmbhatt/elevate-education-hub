import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList,
  FileText, BarChart3, LogOut, Calendar, Upload, Award, Bell, MessageSquare, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Teachers', url: '/dashboard/teachers', icon: Users },
  { title: 'Students', url: '/dashboard/students', icon: Users },
  { title: 'Classes', url: '/dashboard/classes', icon: BookOpen },
  { title: 'Subjects', url: '/dashboard/subjects', icon: ClipboardList },
  { title: 'Notices', url: '/dashboard/notices', icon: Bell },
  { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Materials', url: '/dashboard/materials', icon: Upload },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

const teacherNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Classes', url: '/dashboard/my-classes', icon: BookOpen },
  { title: 'Attendance', url: '/dashboard/attendance', icon: Calendar },
  { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
  { title: 'Marks', url: '/dashboard/marks', icon: Award },
  { title: 'Materials', url: '/dashboard/materials', icon: Upload },
  { title: 'Notices', url: '/dashboard/notices', icon: Bell },
  { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
];

const studentNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'My Classes', url: '/dashboard/my-classes', icon: BookOpen },
  { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
  { title: 'Attendance', url: '/dashboard/my-attendance', icon: Calendar },
  { title: 'Marks', url: '/dashboard/my-marks', icon: Award },
  { title: 'Materials', url: '/dashboard/materials', icon: Upload },
  { title: 'Notices', url: '/dashboard/notices', icon: Bell },
  { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
];

const parentNav = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Attendance', url: '/dashboard/child-attendance', icon: Calendar },
  { title: 'Marks', url: '/dashboard/child-marks', icon: Award },
  { title: 'Notices', url: '/dashboard/notices', icon: Bell },
  { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  { title: 'Assignments', url: '/dashboard/child-assignments', icon: FileText },
];

function getNavItems(role: string) {
  switch (role) {
    case 'admin': return adminNav;
    case 'teacher': return teacherNav;
    case 'student': return studentNav;
    case 'parent': return parentNav;
    default: return [];
  }
}

function getRoleBadge(role: string) {
  const colors: Record<string, string> = {
    admin: 'bg-primary/10 text-primary',
    teacher: 'bg-success/10 text-success',
    student: 'bg-warning/10 text-warning',
    parent: 'bg-muted text-muted-foreground',
  };
  return colors[role] || colors.admin;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const navItems = getNavItems(profile.role);

  return (
    <div className="min-h-screen flex bg-subtle">
      {/* Sidebar */}
      <aside className="w-60 bg-card flex flex-col shadow-subtle shrink-0 sticky top-0 h-screen">
        <div className="p-5 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">Academy OS</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === '/dashboard'}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-muted-foreground transition-colors hover:bg-muted/50"
              activeClassName="bg-card shadow-active text-foreground font-medium"
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${getRoleBadge(profile.role)}`}>
                {profile.role}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={async () => { await signOut(); navigate('/login'); }}
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
