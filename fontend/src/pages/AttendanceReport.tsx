import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAttendance } from '@/data/mockData';
import { Attendance } from '@/types';
import { Calendar, Search, Download, Filter } from 'lucide-react';

const AttendanceReport: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  // Load attendance data
  useEffect(() => {
    const storedAttendance = localStorage.getItem('attendance_records');
    const data: Attendance[] = storedAttendance
      ? JSON.parse(storedAttendance)
      : mockAttendance;
    
    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAttendance(data);
    setFilteredAttendance(data);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...attendance];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((a) => a.date === dateFilter);
    }

    setFilteredAttendance(filtered);
  }, [attendance, searchTerm, statusFilter, dateFilter]);

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

  // Calculate statistics
  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter((a) => a.status === 'present').length,
    absent: filteredAttendance.filter((a) => a.status === 'absent').length,
    late: filteredAttendance.filter((a) => a.status === 'late').length,
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Date', 'Status'];
    const rows = filteredAttendance.map((a) => [
      a.studentId,
      a.studentName,
      a.date,
      a.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Attendance Report
            </h1>
            <p className="mt-1 text-muted-foreground">
              View and export attendance records
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="font-display text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="font-display text-2xl font-bold text-success">{stats.present}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="font-display text-2xl font-bold text-destructive">{stats.absent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="font-display text-2xl font-bold text-warning">{stats.late}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            {(searchTerm || statusFilter !== 'all' || dateFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('');
                }}
              >
                Clear
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Showing {filteredAttendance.length} of {attendance.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAttendance.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          {record.studentName}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                No attendance records found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceReport;
