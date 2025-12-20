import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StudentPerformanceChart from '@/components/StudentPerformanceChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp } from 'lucide-react';

interface StudentData {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
}

interface AttendanceRecord {
  studentId: string;
  month: string;
  present: number;
  absent: number;
  late: number;
}

interface ActivityRecord {
  category: string;
  count: number;
}

const StudentStatsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [activityData, setActivityData] = useState<ActivityRecord[]>([]);
  const [stats, setStats] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('attendance_app_token');
        const response = await axios.get(`${BACKEND_URL}students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setStudents(response.data.data);
          if (response.data.data.length > 0) {
            setSelectedStudent(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load students',
          variant: 'destructive',
        });
      }
    };

    fetchStudents();
  }, [toast]);

  // Fetch data for selected student
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchStudentData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('attendance_app_token');

        const [attendanceRes, activitiesRes] = await Promise.all([
          axios.get(`${BACKEND_URL}attendance/report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BACKEND_URL}activity/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Filter attendance for selected student
        const studentAttendance = attendanceRes.data.data.filter(
          (a: any) => a.studentId?._id === selectedStudent
        );

        // Group by month
        const monthData: { [key: string]: { present: number; absent: number; late: number } } = {};
        studentAttendance.forEach((record: any) => {
          const date = new Date(record.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthData[monthKey]) {
            monthData[monthKey] = { present: 0, absent: 0, late: 0 };
          }
          const status = record.status.toLowerCase();
          if (status === 'present') monthData[monthKey].present++;
          else if (status === 'absent') monthData[monthKey].absent++;
          else if (status === 'late') monthData[monthKey].late++;
        });

        const attendanceChartData = Object.entries(monthData).map(([month, data]) => ({
          month,
          ...data,
        }));

        setAttendanceData(attendanceChartData);

        // Filter activities for selected student
        const studentActivities = activitiesRes.data.data.filter(
          (a: any) => a.studentId?._id === selectedStudent
        );

        // Group by category
        const categoryCount: { [key: string]: number } = {};
        studentActivities.forEach((activity: any) => {
          categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });

        const activityChartData = Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count,
        }));

        setActivityData(activityChartData);

        // Calculate overall stats
        const presentCount = studentAttendance.filter(
          (a: any) => a.status.toLowerCase() === 'present'
        ).length;
        const absentCount = studentAttendance.filter(
          (a: any) => a.status.toLowerCase() === 'absent'
        ).length;
        const lateCount = studentAttendance.filter(
          (a: any) => a.status.toLowerCase() === 'late'
        ).length;
        const total = studentAttendance.length;
        const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

        setStats({
          totalPresent: presentCount,
          totalAbsent: absentCount,
          totalLate: lateCount,
          attendanceRate: rate,
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedStudent]);

  const selectedStudentName = students.find((s) => s._id === selectedStudent)?.name || '';

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-8 glass border border-primary/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Student Performance
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Detailed analytics and insights
                </p>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
        </div>

        {/* Student Selector */}
        <Card className="hover-lift glass">
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>Choose a student to view their performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student._id} value={student._id}>
                    {student.name} (Roll: {student.rollNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        {!isLoading && selectedStudentName && (
          <StudentPerformanceChart
            studentName={selectedStudentName}
            attendanceData={attendanceData}
            activityData={activityData}
            overallStats={stats}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentStatsPage;
