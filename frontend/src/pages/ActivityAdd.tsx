import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockStudents, mockActivities, activityCategories } from '@/data/mockData';
import { Activity, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Save, Loader2 } from 'lucide-react';

const ActivityAdd: React.FC = () => {
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
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
          id: student._id,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.studentId || !formData.title || !formData.category || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.post(
        `${BACKEND_URL}activity/add`,
        {
          studentId: formData.studentId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          date: formData.date,
        },
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
          title: "Activity added!",
          description: `"${formData.title}" has been recorded successfully.`,
        });

        // Reset form
        setFormData({
          studentId: '',
          title: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
        });

        navigate('/activity/list');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to add activity';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Add Co-Curriculum Activity
          </h1>
          <p className="mt-1 text-muted-foreground">
            Record a new student activity or achievement
          </p>
        </div>

        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Activity Details</CardTitle>
                <CardDescription>
                  Fill in the information about the activity
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={formData.studentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, studentId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chess Tournament, Science Fair"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Activity Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the activity, achievements, or participation details..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/activity/list')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Activity
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityAdd;
