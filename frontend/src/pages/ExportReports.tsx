import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileText, Table2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_Backend_Url;

const ExportReports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExportAttendanceExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendance_app_token');
      
      const response = await axios.get(`${BACKEND_URL}export/attendance/excel`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      toast({
        title: 'Success',
        description: 'Attendance report exported successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export attendance report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportActivityExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendance_app_token');
      
      const response = await axios.get(`${BACKEND_URL}export/activity/excel`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_report_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      toast({
        title: 'Success',
        description: 'Activity report exported successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export activity report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAttendancePDF = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('attendance_app_token');
      
      const response = await axios.get(`${BACKEND_URL}export/attendance/pdf`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);

      toast({
        title: 'Success',
        description: 'PDF report exported successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export PDF report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Export Reports</h1>
          <p className="text-gray-600 mt-2">Download your attendance and activity reports in Excel or PDF format</p>
        </div>

        {/* Date Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Date Range</CardTitle>
            <CardDescription>Leave empty to export all records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Attendance Reports
              </CardTitle>
              <CardDescription>Export attendance data in your preferred format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleExportAttendanceExcel}
                disabled={loading}
                className="w-full"
              >
                <Table2 className="w-4 h-4 mr-2" />
                Export as Excel
              </Button>
              <Button
                onClick={handleExportAttendancePDF}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
            </CardContent>
          </Card>

          {/* Activity Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Activity Reports
              </CardTitle>
              <CardDescription>Export activity records with points and participation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportActivityExcel}
                disabled={loading}
                className="w-full"
              >
                <Table2 className="w-4 h-4 mr-2" />
                Export as Excel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700">
              <strong>📌 Tip:</strong> Select a date range to export only records within that period. Leave dates empty to export all available records. Excel files include summary statistics at the bottom.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExportReports;
