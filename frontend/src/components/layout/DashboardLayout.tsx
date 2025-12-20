import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Trophy,
  List,
  LogOut,
  Menu,
  X,
  User,
  Users,
  BookMarked,
  Award,
  MessageCircle,
  Download,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getNavItems = (role?: string) => {
  const baseItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student-stats', label: 'Student Stats', icon: Trophy },
    { path: '/chatbot', label: 'Assistant', icon: MessageCircle },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/export', label: 'Export Reports', icon: Download },
  ];

  const teacherItems = [
    { path: '/students', label: 'Manage Students', icon: Users },
    { path: '/student-subjects', label: 'Assign Subjects', icon: BookMarked },
    { path: '/curriculum', label: 'Curriculum', icon: BookMarked },
    { path: '/attendance/mark', label: 'Mark Attendance', icon: ClipboardCheck },
    { path: '/attendance/report', label: 'Attendance Report', icon: FileText },
    { path: '/activity/add', label: 'Add Activity', icon: Trophy },
    { path: '/activity/list', label: 'Activity List', icon: List },
    { path: '/certificates', label: 'Certificates', icon: Award },
  ];

  const studentItems = [
    { path: '/attendance/report', label: 'My Attendance', icon: FileText },
    { path: '/activity/list', label: 'My Activities', icon: List },
  ];

  if (role === 'teacher') {
    return [...baseItems, ...teacherItems];
  } else if (role === 'student') {
    return [...baseItems, ...studentItems];
  } else if (role === 'admin') {
    return [...baseItems, ...teacherItems];
  }

  return baseItems;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 lg:hidden glass">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-display font-semibold text-foreground">
          Attendance System
        </span>
        <ThemeToggle />
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4">
          <span className="font-display text-lg font-bold text-sidebar-foreground">
            📚 EduTrack
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info */}
        <div className="mx-4 mb-4 rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="container max-w-6xl py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
