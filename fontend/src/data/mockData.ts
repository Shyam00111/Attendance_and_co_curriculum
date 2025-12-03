import { User, Attendance, Activity } from '@/types';

// Mock students data
export const mockStudents: User[] = [
  { id: '1', name: 'Ahmad Razak', email: 'ahmad@student.edu', role: 'student', createdAt: '2024-01-15' },
  { id: '2', name: 'Siti Nurhaliza', email: 'siti@student.edu', role: 'student', createdAt: '2024-01-15' },
  { id: '3', name: 'Muhammad Faiz', email: 'faiz@student.edu', role: 'student', createdAt: '2024-01-16' },
  { id: '4', name: 'Nur Aisyah', email: 'aisyah@student.edu', role: 'student', createdAt: '2024-01-16' },
  { id: '5', name: 'Hafiz Rahman', email: 'hafiz@student.edu', role: 'student', createdAt: '2024-01-17' },
  { id: '6', name: 'Fatimah Zahra', email: 'fatimah@student.edu', role: 'student', createdAt: '2024-01-17' },
  { id: '7', name: 'Amir Hassan', email: 'amir@student.edu', role: 'student', createdAt: '2024-01-18' },
  { id: '8', name: 'Nurul Huda', email: 'nurul@student.edu', role: 'student', createdAt: '2024-01-18' },
  { id: '9', name: 'Zulkifli Ahmad', email: 'zulkifli@student.edu', role: 'student', createdAt: '2024-01-19' },
  { id: '10', name: 'Aminah Yusof', email: 'aminah@student.edu', role: 'student', createdAt: '2024-01-19' },
];

// Mock teachers/admin data
export const mockTeachers: User[] = [
  { id: 'admin1', name: 'Admin User', email: 'admin@school.edu', role: 'admin', createdAt: '2024-01-01' },
  { id: 'teacher1', name: 'Encik Rosli', email: 'rosli@school.edu', role: 'teacher', createdAt: '2024-01-01' },
  { id: 'teacher2', name: 'Puan Mariam', email: 'mariam@school.edu', role: 'teacher', createdAt: '2024-01-02' },
];

// Generate today's date string
const today = new Date().toISOString().split('T')[0];

// Mock attendance data
export const mockAttendance: Attendance[] = [
  { id: 'att1', studentId: '1', studentName: 'Ahmad Razak', date: today, status: 'present' },
  { id: 'att2', studentId: '2', studentName: 'Siti Nurhaliza', date: today, status: 'present' },
  { id: 'att3', studentId: '3', studentName: 'Muhammad Faiz', date: today, status: 'absent' },
  { id: 'att4', studentId: '4', studentName: 'Nur Aisyah', date: today, status: 'late' },
  { id: 'att5', studentId: '5', studentName: 'Hafiz Rahman', date: today, status: 'present' },
];

// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: 'act1',
    studentId: '1',
    studentName: 'Ahmad Razak',
    title: 'Chess Club Tournament',
    description: 'Participated in the inter-school chess championship and achieved 2nd place.',
    category: 'Sports',
    date: '2024-11-20',
    createdAt: '2024-11-20',
  },
  {
    id: 'act2',
    studentId: '2',
    studentName: 'Siti Nurhaliza',
    title: 'Science Fair Project',
    description: 'Presented a project on renewable energy sources at the annual science fair.',
    category: 'Academic',
    date: '2024-11-18',
    createdAt: '2024-11-18',
  },
  {
    id: 'act3',
    studentId: '3',
    studentName: 'Muhammad Faiz',
    title: 'Debate Competition',
    description: 'Won the district-level debate competition on environmental conservation.',
    category: 'Academic',
    date: '2024-11-15',
    createdAt: '2024-11-15',
  },
  {
    id: 'act4',
    studentId: '5',
    studentName: 'Hafiz Rahman',
    title: 'Volunteer Work',
    description: 'Participated in community clean-up campaign at the local park.',
    category: 'Community Service',
    date: '2024-11-12',
    createdAt: '2024-11-12',
  },
  {
    id: 'act5',
    studentId: '4',
    studentName: 'Nur Aisyah',
    title: 'Art Exhibition',
    description: 'Displayed artwork in the school art exhibition, theme: Malaysian Heritage.',
    category: 'Arts',
    date: '2024-11-10',
    createdAt: '2024-11-10',
  },
];

// Activity categories
export const activityCategories = [
  'Sports',
  'Academic',
  'Arts',
  'Community Service',
  'Leadership',
  'Cultural',
  'Technology',
  'Other',
];
