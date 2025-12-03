import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { mockTeachers } from '@/data/mockData';

// Create the context
const AuthContext = createContext<AuthState | undefined>(undefined);

// Storage keys
const AUTH_USER_KEY = 'attendance_app_user';
const AUTH_USER_TOKEN = 'attendance_app_token';
const USERS_KEY = 'attendance_app_users';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }

    // Initialize mock users if not exists
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(mockTeachers));
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get users from localStorage
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockTeachers;

    // Find user by email (in real app, would verify password with backend)
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      // For demo: accept any password for existing users
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(foundUser));
      return true;
    }

    return false;
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: User['role']
  ): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get existing users
    const storedUsers = localStorage.getItem(USERS_KEY);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto-login after registration
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

    return true;
  };

  // Logout function
  const logout = () => {
    console.log('Logout called')
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_USER_TOKEN);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
