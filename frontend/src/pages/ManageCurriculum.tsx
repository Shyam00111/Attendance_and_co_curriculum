import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, BookOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  totalTopics: number;
  completedTopics: number;
  createdAt: string;
}

const ManageCurriculum: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const { toast } = useToast();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.get(`${BACKEND_URL}subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subjects';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.post(
        `${BACKEND_URL}subjects`,
        {
          name: formData.name.trim(),
          code: formData.code.trim(),
          description: formData.description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Subject created successfully',
        });

        setFormData({
          name: '',
          code: '',
          description: '',
        });
        setShowForm(false);
        
        // Trigger dashboard refresh
        window.dispatchEvent(new Event('dataUpdated'));
        
        fetchSubjects();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create subject';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Curriculum Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Create and manage subjects and syllabus topics
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>

        {/* Create Subject Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Subject</CardTitle>
              <CardDescription>Add a new subject to your curriculum</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="E.g., Mathematics"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code *</Label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="E.g., MATH-101"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Subject description (optional)"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Creating...' : 'Create Subject'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subjects List */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects ({subjects.length})</CardTitle>
            <CardDescription>
              List of all subjects with syllabus progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-2">No subjects created yet. Click "Add Subject" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map(subject => {
                  const progressPercentage = getProgressPercentage(subject.completedTopics, subject.totalTopics);
                  return (
                    <div key={subject.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground">{subject.code}</p>
                        {subject.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{subject.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                              <span>Syllabus Progress</span>
                              <span>{subject.completedTopics}/{subject.totalTopics} topics</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4"
                      >
                        View Topics
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageCurriculum;
