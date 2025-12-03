import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Axis3DIcon, BookOpen, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
          const loginResponse = await axios.post(`${BACKEND_URL}auth/login`, {
            name: name.trim(),
            email: email.trim(),
            password,
            role: 'teacher',
          });
        if (loginResponse.status === 201 || loginResponse.status === 200) {
            if (loginResponse.data.data) {
              const user = loginResponse.data.data;
              localStorage.setItem('attendance_app_user', JSON.stringify(user));
              localStorage.setItem('attendance_app_token', loginResponse.data.token);
              
              toast({
                title: "Account created!",
                description: "You have been registered and logged in.",
              });
              navigate('/dashboard');
            }
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Try: admin@school.edu",
            variant: "destructive",
          });
        }
      } else {
        if (!name.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your name.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        try {
          const response = await axios.post(`${BACKEND_URL}auth/register`, {
            name: name.trim(),
            email: email.trim(),
            password,
            role: 'teacher',
          });

          if (response.status === 201 || response.status === 200) {
            // Auto-login after registration
            const loginResponse = await axios.post(`${BACKEND_URL}auth/login`, {
              email: email.trim(),
              password,
            });

            if (loginResponse.data.data) {
              const user = loginResponse.data.data;
              localStorage.setItem('attendance_app_user', JSON.stringify(user));
              localStorage.setItem('attendance_app_token', loginResponse.data.token);
              
              toast({
                title: "Account created!",
                description: "You have been registered and logged in.",
              });
              navigate('/dashboard');
            }
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Email already exists. Please try a different email.';
          toast({
            title: "Registration failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            EduTrack
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Attendance & Co-Curriculum Management
          </p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Enter your details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-center text-xs text-muted-foreground">
                <p className="font-medium">Demo credentials:</p>
                <p>Email: admin@school.edu | Password: any</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
