// User model type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
}

// Attendance model type
export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

// Co-curriculum Activity model type
export interface Activity {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

// Auth context type
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
  logout: () => void;
}

// Stats for dashboard
export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  totalActivities: number;
  attendanceRate: number;
}
