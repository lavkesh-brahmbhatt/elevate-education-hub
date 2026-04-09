import { ReactNode, useState } from 'react';
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList,
  FileText, BarChart3, LogOut, Calendar, Upload, Award, Bell, MessageSquare, Settings, UserCheck, ChevronRight, CreditCard, CheckCircle2, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolBackground from './SchoolBackground';

type NavItem = { title: string; url: string; icon: any };
type NavGroup = { label: string; items: NavItem[] };

const adminNav: NavGroup[] = [
  { label: 'Management', items: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Teachers', url: '/dashboard/teachers', icon: UserCheck },
    { title: 'Students', url: '/dashboard/students', icon: Users },
    { title: 'Classes', url: '/dashboard/classes', icon: BookOpen },
    { title: 'Subjects', url: '/dashboard/subjects', icon: ClipboardList },
    { title: 'Fees', url: '/dashboard/fees', icon: CreditCard },
    { title: 'Timetable', url: '/dashboard/timetable', icon: Calendar },
  ]},
  { label: 'Communication', items: [
    { title: 'Notices', url: '/dashboard/notices', icon: Bell },
    { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  ]},
  { label: 'Insights', items: [
    { title: 'Analytics', url: '/dashboard/analytics', icon: BarChart3 },
    { title: 'Materials', url: '/dashboard/materials', icon: Upload },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ]}
];

const teacherNav: NavGroup[] = [
  { label: 'Teaching', items: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Classes', url: '/dashboard/my-classes', icon: BookOpen },
    { title: 'Attendance', url: '/dashboard/attendance', icon: Calendar },
    { title: 'Assignments', url: '/dashboard/assignments', icon: FileText },
    { title: 'Marks', url: '/dashboard/marks', icon: Award },
    { title: 'Timetable', url: '/dashboard/timetable-view', icon: Calendar },
  ]},
  { label: 'Resources', items: [
    { title: 'Materials', url: '/dashboard/materials', icon: Upload },
    { title: 'Notices', url: '/dashboard/notices', icon: Bell },
    { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  ]}
];

const studentNav: NavGroup[] = [
  { label: 'Academics', items: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Classes', url: '/dashboard/my-classes', icon: BookOpen },
    { title: 'Assignments', url: '/dashboard/my-assignments', icon: FileText },
    { title: 'Attendance', url: '/dashboard/my-attendance', icon: Calendar },
    { title: 'Marks', url: '/dashboard/my-marks', icon: Award },
    { title: 'My Fees', url: '/dashboard/my-fees', icon: CreditCard },
    { title: 'Timetable', url: '/dashboard/timetable-view', icon: Calendar },
  ]},
  { label: 'School Life', items: [
    { title: 'Materials', url: '/dashboard/materials', icon: Upload },
    { title: 'Notices', url: '/dashboard/notices', icon: Bell },
    { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  ]}
];

const parentNav: NavGroup[] = [
  { label: 'My Child', items: [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Attendance', url: '/dashboard/child-attendance', icon: Calendar },
    { title: 'Marks', url: '/dashboard/child-marks', icon: Award },
    { title: 'Assignments', url: '/dashboard/child-assignments', icon: FileText },
  ]},
  { label: 'School', items: [
    { title: 'Notices', url: '/dashboard/notices', icon: Bell },
    { title: 'Complaints', url: '/dashboard/complaints', icon: MessageSquare },
  ]}
];

function getNavGroups(role: string) {
  switch (role) {
    case 'admin': return adminNav;
    case 'teacher': return teacherNav;
    case 'student': return studentNav;
    case 'parent': return parentNav;
    default: return [];
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!profile) return null;

  const navGroups = getNavGroups(profile.role);

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 flex flex-col gap-1">
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => { navigate('/dashboard'); setIsMobileOpen(false); }}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-primary flex items-center justify-center shadow-primary transition-transform group-hover:scale-110 duration-500">
            <GraduationCap className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-none tabular-nums">ACADEMY OS</span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mt-1 block opacity-60">Elevate Hub</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-5 py-2 space-y-8 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300/30 mb-4">
              {group.label}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
                return (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3.5 text-sm rounded-2xl transition-all duration-300 group relative
                      ${isActive 
                        ? 'bg-white/10 text-white shadow-active ring-1 ring-white/10 translate-x-1' 
                        : 'text-indigo-100/70 hover:text-indigo-50 hover:bg-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-indigo-400' : 'text-current'}`} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={`font-bold tracking-wide ${isActive ? 'translate-x-0.5' : ''} transition-transform`}>{item.title}</span>
                    </div>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-[-20px] w-1 h-6 bg-indigo-400 rounded-r-full shadow-[0_0_10px_#4F46E5]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400 animate-in fade-in slide-in-from-left-2" />}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-black shadow-lg">
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 rounded-xl h-10 px-3 transition-all active:scale-95"
            onClick={async () => { await signOut(); navigate('/login'); }}
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={2} />
            <span className="font-bold text-xs uppercase tracking-widest">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside 
        className="w-72 hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-50 border-r border-white/10"
        style={{ background: 'linear-gradient(180deg, rgba(26,21,96,0.95) 0%, rgba(15,12,61,0.98) 60%, rgba(10,8,40,1) 100%)', backdropFilter: 'blur(20px)' }}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 relative h-screen overflow-y-auto">
        <SchoolBackground />
        
        {/* Minimalist Top Actions (Sticky Icons Only) */}
        <div className="sticky top-0 z-40 w-full px-6 lg:px-10 py-6 flex items-center justify-between lg:justify-end pointer-events-none">
            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden pointer-events-auto">
              <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-white/20 text-primary transition-all active:scale-95">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-navy-900 border-r-white/10">
                   <div className="h-full" style={{ background: 'linear-gradient(180deg, rgba(26,21,96,1) 0%, rgba(10,8,40,1) 100%)' }}>
                      <SidebarContent />
                   </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="pointer-events-auto">
              <Popover onOpenChange={(open) => { if (open) markAllRead(); }}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg hover:bg-white text-primary border border-white/20 transition-all active:scale-90">
                        <Bell size={20} />
                        <AnimatePresence>
                          {unreadCount > 0 && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white border-2 border-white font-black text-[10px] rounded-full z-10 shadow-lg"
                              >
                                  {unreadCount}
                              </motion.div>
                          )}
                        </AnimatePresence>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-3xl border-none shadow-2xl overflow-hidden mt-4 scale-in group">
                    <div className="bg-gradient-primary p-6 text-white">
                        <h4 className="font-black text-lg">Notifications</h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Recent Updates</p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto bg-white custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center space-y-3">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-20" />
                                <p className="text-[10px] font-black uppercase text-slate-400">All caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <Link 
                                      key={n._id} to={n.link || '#'} 
                                      className={`block p-4 hover:bg-slate-50 transition-colors ${!n.readAt ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <p className="text-[10px] font-black uppercase text-indigo-500 mb-1">{n.title}</p>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.body}</p>
                                        <p className="text-[9px] text-slate-300 font-bold mt-2 uppercase tabular-nums">
                                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </PopoverContent>
              </Popover>
            </div>
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
