import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { mockStudents, mockAttendance } from '@/data/mockData';
import { Attendance, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, Clock, Search, Save, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const AttendanceMark: React.FC = () => {
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Attendance['status']>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  // Fetch students from backend
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.get(`${BACKEND_URL}students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const apiStudents = response.data.data.map((student: any) => ({
          id: student._id,  // Map MongoDB _id to id for internal use
          _id: student._id, // Keep _id for API calls
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          class: student.class,
        }));
        setStudents(apiStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Keep using mock students as fallback
    }
  };

  // Load existing attendance for the selected date
  useEffect(() => {
    fetchStudents();
    
    // Listen for data updates from other pages
    const handleDataUpdate = () => {
      fetchStudents();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  useEffect(() => {
    const storedAttendance = localStorage.getItem('attendance_records');
    const allAttendance: Attendance[] = storedAttendance
      ? JSON.parse(storedAttendance)
      : mockAttendance;

    // Filter by selected date and create a map
    const dateAttendance = allAttendance.filter((a) => a.date === selectedDate);
    const map: Record<string, Attendance['status']> = {};
    dateAttendance.forEach((a) => {
      map[a.studentId] = a.status;
    });
    setAttendanceMap(map);
  }, [selectedDate]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (studentId: string, status: Attendance['status']) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(attendanceMap).length === 0) {
      toast({
        title: 'No attendance marked',
        description: 'Please mark attendance for at least one student',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('attendance_app_token');
      
      // Convert attendanceMap to records array
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        date: selectedDate,
        status: status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Late',
      }));

      const response = await axios.post(
        `${BACKEND_URL}attendance/mark`,
        { records },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Trigger dashboard refresh
        window.dispatchEvent(new Event('dataUpdated'));

        toast({
          title: 'Attendance saved!',
          description: `Recorded attendance for ${records.length} students on ${selectedDate}.`,
        });

        // Reset the form
        setAttendanceMap({});
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to save attendance';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
      console.error('Attendance error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyle = (
    studentId: string,
    status: Attendance['status']
  ) => {
    const isSelected = attendanceMap[studentId] === status;
    const baseClass = "flex-1 transition-all duration-200";

    if (!isSelected) return cn(baseClass, "opacity-50 hover:opacity-75");

    switch (status) {
      case 'present':
        return cn(baseClass, "bg-success text-success-foreground hover:bg-success/90");
      case 'absent':
        return cn(baseClass, "bg-destructive text-destructive-foreground hover:bg-destructive/90");
      case 'late':
        return cn(baseClass, "bg-warning text-warning-foreground hover:bg-warning/90");
    }
  };

  const markedCount = Object.keys(attendanceMap).length;
  const presentCount = Object.values(attendanceMap).filter(
    (s) => s === 'present'
  ).length;
  const absentCount = Object.values(attendanceMap).filter(
    (s) => s === 'absent'
  ).length;
  const lateCount = Object.values(attendanceMap).filter(
    (s) => s === 'late'
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Mark Attendance
            </h1>
            <p className="mt-1 text-muted-foreground">
              Record student attendance for the selected date
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || markedCount === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Attendance
          </Button>
        </div>

        {/* Filters and Stats */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">{presentCount}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{lateCount}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              Click on a status button to mark attendance for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-card sm:flex-row sm:items-center sm:justify-between animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={getButtonStyle(student.id, 'present')}
                      onClick={() => handleStatusChange(student.id, 'present')}
                    >
                      <UserCheck className="mr-1 h-4 w-4" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={getButtonStyle(student.id, 'absent')}
                      onClick={() => handleStatusChange(student.id, 'absent')}
                    >
                      <UserX className="mr-1 h-4 w-4" />
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={getButtonStyle(student.id, 'late')}
                      onClick={() => handleStatusChange(student.id, 'late')}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Late
                    </Button>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No students found matching your search
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceMark;
