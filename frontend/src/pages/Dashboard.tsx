import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  useEffect(() => {
    // Load data from localStorage or use mock data
    const storedAttendance = localStorage.getItem('attendance_records');
    const storedActivities = localStorage.getItem('activity_records');

    const attendance: Attendance[] = storedAttendance
      ? JSON.parse(storedAttendance)
      : mockAttendance;
    const activities: Activity[] = storedActivities
      ? JSON.parse(storedActivities)
      : mockActivities;

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter((a) => a.date === today);
    const present = todayAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const absent = todayAttendance.filter((a) => a.status === 'absent').length;
    const rate = todayAttendance.length > 0
      ? Math.round((present / todayAttendance.length) * 100)
      : 0;

    setStats({
      totalStudents: mockStudents.length,
      presentToday: present,
      absentToday: absent,
      totalActivities: activities.length,
      attendanceRate: rate,
    });

    setRecentAttendance(attendance.slice(0, 5));
    setRecentActivities(activities.slice(0, 4));
  }, []);

  const getStatusBadge = (status: Attendance['status']) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Present</Badge>;
      case 'absent':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Absent</Badge>;
      case 'late':
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Late</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of attendance and co-curriculum activities
          </p>
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
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-elevated hover:ring-2 hover:ring-primary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <ClipboardCheck className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    Mark Attendance
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Record today's student attendance
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/activity/add">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-elevated hover:ring-2 hover:ring-primary/20">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning text-warning-foreground">
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-foreground">
                    Add Activity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Submit a new co-curriculum activity
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Data Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Attendance */}
          <Card>
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
          <Card>
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
