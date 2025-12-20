import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  enrolledSubjects: any[];
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

const StudentSubjects: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const [studentsRes, subjectsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${BACKEND_URL}subjects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
        if (studentsRes.data.data.length > 0) {
          setSelectedStudent(studentsRes.data.data[0]._id);
        }
      }
      if (subjectsRes.data.success) {
        setSubjects(subjectsRes.data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStudentData = students.find(s => s._id === selectedStudent);

  const handleAddSubject = async (subjectId: string) => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.post(
        `${BACKEND_URL}enrollment/add-subject`,
        { studentId: selectedStudent, subjectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudents(students.map(s => s._id === selectedStudent ? response.data.data : s));
        toast({ title: 'Success', description: 'Subject added to student' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add subject',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.post(
        `${BACKEND_URL}enrollment/remove-subject`,
        { studentId: selectedStudent, subjectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStudents(students.map(s => s._id === selectedStudent ? response.data.data : s));
        toast({ title: 'Success', description: 'Subject removed from student' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove subject', variant: 'destructive' });
    }
  };

  const getAvailableSubjects = () => {
    if (!selectedStudentData) return [];
    const enrolledIds = selectedStudentData.enrolledSubjects.map((s: any) => s._id || s);
    return subjects.filter(s => !enrolledIds.includes(s._id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Assign Subjects to Students
          </h1>
          <p className="mt-1 text-muted-foreground">Enroll students in subjects</p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Selector */}
            <Card className="hover-lift glass">
              <CardHeader>
                <CardTitle>Select Student</CardTitle>
                <CardDescription>Choose a student to manage subjects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.rollNumber})
                    </option>
                  ))}
                </select>

                {selectedStudentData && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm space-y-2">
                    <p><strong>Name:</strong> {selectedStudentData.name}</p>
                    <p><strong>Roll:</strong> {selectedStudentData.rollNumber}</p>
                    <p><strong>Class:</strong> {selectedStudentData.class}</p>
                    <p><strong>Enrolled:</strong> {selectedStudentData.enrolledSubjects.length} subjects</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enrolled Subjects */}
            <Card className="hover-lift glass">
              <CardHeader>
                <CardTitle>Enrolled Subjects</CardTitle>
                <CardDescription>Current subjects for this student</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStudentData?.enrolledSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subjects enrolled yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentData?.enrolledSubjects.map((subject: any) => (
                      <div key={subject._id || subject} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubject(subject._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Subjects */}
            <Card className="md:col-span-2 hover-lift glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Subjects
                </CardTitle>
                <CardDescription>Available subjects to enroll</CardDescription>
              </CardHeader>
              <CardContent>
                {getAvailableSubjects().length === 0 ? (
                  <p className="text-muted-foreground">All subjects are already enrolled</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {getAvailableSubjects().map((subject) => (
                      <div key={subject._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-semibold text-sm">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddSubject(subject._id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentSubjects;
