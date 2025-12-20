import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockStudents, mockAttendance, mockActivities } from '@/data/mockData';
import { Attendance, Activity, DashboardStats } from '@/types';
import {
  Users,
  UserCheck,
  UserX,
  Trophy,
  TrendingUp,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    totalActivities: 0,
    attendanceRate: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for data updates from other pages
    const handleDataUpdate = () => {
      fetchDashboardData();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    // Refetch data when user returns to the page (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Refetch data every 30 seconds to keep stats updated
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      
      // Fetch students and subjects from backend
      const [studentsRes, activitiesRes, attendanceRes] = await Promise.all([
        axios.get(`${BACKEND_URL}students`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${BACKEND_URL}activity/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        axios.get(`${BACKEND_URL}attendance/report`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      const students = studentsRes.data.data || [];
      const activities = activitiesRes.data.data || [];
      const attendance = attendanceRes.data.data || [];

      // Create a set of valid student IDs for filtering
      const validStudentIds = new Set(students.map((s: any) => s._id));

      // Calculate stats - only count attendance for existing students
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter((a: any) => 
        a.date?.split('T')[0] === today && validStudentIds.has(a.studentId?._id)
      );
      const present = todayAttendance.filter((a: any) => a.status === 'Present' || a.status === 'late').length;
      const absent = todayAttendance.filter((a: any) => a.status === 'Absent').length;
      const rate = todayAttendance.length > 0
        ? Math.round((present / todayAttendance.length) * 100)
        : 0;

      setStats({
        totalStudents: students.length,
        presentToday: present,
        absentToday: absent,
        totalActivities: activities.length,
        attendanceRate: rate,
      });

      // Format recent attendance - only show records for existing students
      const formattedAttendance = attendance
        .filter((a: any) => a.studentId?.name && validStudentIds.has(a.studentId?._id))
        .slice(0, 5)
        .map((a: any) => ({
          id: a._id,
          studentName: a.studentId?.name,
          date: new Date(a.date).toLocaleDateString(),
          status: a.status.toLowerCase() as any,
        }));
      setRecentAttendance(formattedAttendance);

      // Format recent activities - only show records for existing students
      const formattedActivities = activities
        .filter((a: any) => a.studentId?.name && validStudentIds.has(a.studentId?._id))
        .slice(0, 4)
        .map((a: any) => ({
          id: a._id,
          title: a.activityName,
          studentName: a.studentId?.name,
          category: a.category,
        }));
      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setStats({
        totalStudents: mockStudents.length,
        presentToday: 0,
        absentToday: 0,
        totalActivities: mockActivities.length,
        attendanceRate: 0,
      });
    }
  };

  const getStatusBadge = (status: Attendance['status']) => {
    switch (status) {
      case 'present':
      case 'Present':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Present</Badge>;
      case 'absent':
      case 'Absent':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Absent</Badge>;
      case 'late':
      case 'Late':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Late</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-8 glass border border-primary/20">
          <div className="relative z-10">
            <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Overview of attendance and co-curriculum activities
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatsCard
            title="Present Today"
            value={stats.presentToday}
            subtitle={stats.attendanceRate > 0 ? `${stats.attendanceRate}% attendance` : undefined}
            trend={stats.attendanceRate >= 80 ? 'up' : 'neutral'}
            icon={UserCheck}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="Absent Today"
            value={stats.absentToday}
            icon={UserX}
            iconClassName="bg-destructive/10 text-destructive"
          />
          <StatsCard
            title="Total Activities"
            value={stats.totalActivities}
            icon={Trophy}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/attendance/mark">
            <Card className="hover-lift glass cursor-pointer border-primary/20 group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <ClipboardCheck className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    Mark Attendance
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Record today's student attendance
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/activity/add">
            <Card className="hover-lift glass cursor-pointer border-warning/20 group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-warning to-accent shadow-glow group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-7 w-7 text-warning-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground group-hover:text-warning transition-colors">
                    Add Activity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submit a new co-curriculum activity
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Data Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Attendance */}
          <Card className="hover-lift glass border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Attendance</CardTitle>
              <Link to="/attendance/report">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentAttendance.length > 0 ? (
                <div className="space-y-3">
                  {recentAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {record.studentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.date}
                        </p>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No attendance records yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="hover-lift glass border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <Link to="/activity/list">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-lg bg-muted/50 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.studentName}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {activity.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No activities recorded yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
