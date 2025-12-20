import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Award, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  activity: string;
  issueDate: string;
  certificateUrl: string;
}

const ManageCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    activity: '',
    issueDate: new Date().toISOString().split('T')[0],
    certificateUrl: '',
  });
  const { toast } = useToast();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.get(`${BACKEND_URL}certificates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCertificates(response.data.data || []);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch certificates';
      console.error(errorMsg);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        `${BACKEND_URL}certificates`,
        {
          studentId: formData.studentId.trim(),
          activity: formData.activity.trim(),
          issueDate: formData.issueDate,
          certificateUrl: formData.certificateUrl.trim(),
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
          description: 'Certificate uploaded successfully',
        });

        setFormData({
          studentId: '',
          activity: '',
          issueDate: new Date().toISOString().split('T')[0],
          certificateUrl: '',
        });
        setShowForm(false);
        fetchCertificates();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to upload certificate';
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (certificateId: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      const token = localStorage.getItem('attendance_app_token');
      await axios.delete(
        `${BACKEND_URL}certificates/${certificateId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: 'Success',
        description: 'Certificate deleted successfully',
      });
      fetchCertificates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete certificate',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Certificate Management
            </h1>
            <p className="mt-1 text-muted-foreground">
              Upload and manage student certificates for activities and achievements
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Certificate
          </Button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Certificate</CardTitle>
              <CardDescription>Record a student certificate for an activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      type="text"
                      placeholder="Enter student ID"
                      value={formData.studentId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      name="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Activity/Achievement *</Label>
                  <Input
                    id="activity"
                    name="activity"
                    type="text"
                    placeholder="E.g., Inter-School Chess Championship - 1st Place"
                    value={formData.activity}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateUrl">Certificate URL / Link</Label>
                  <Input
                    id="certificateUrl"
                    name="certificateUrl"
                    type="url"
                    placeholder="Link to certificate or proof document"
                    value={formData.certificateUrl}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Uploading...' : 'Upload Certificate'}
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

        {/* Certificates List */}
        <Card>
          <CardHeader>
            <CardTitle>Certificates ({certificates.length})</CardTitle>
            <CardDescription>
              All uploaded student certificates and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Award className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-2">No certificates uploaded yet. Click "Upload Certificate" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Activity/Achievement</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map(cert => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.studentId}</TableCell>
                        <TableCell>{cert.activity}</TableCell>
                        <TableCell>
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {cert.certificateUrl ? (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <Download className="h-4 w-4" />
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(cert.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageCertificates;
