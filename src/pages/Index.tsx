import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Trophy, ClipboardCheck, ArrowRight, Sparkles } from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: ClipboardCheck,
      title: 'Attendance Tracking',
      description: 'Mark and monitor student attendance with ease',
    },
    {
      icon: Trophy,
      title: 'Activity Management',
      description: 'Record co-curriculum achievements and activities',
    },
    {
      icon: Users,
      title: 'Student Database',
      description: 'Manage student information in one place',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b bg-card/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              EduTrack
            </span>
          </div>
          <Button onClick={() => navigate('/login')}>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <section className="container py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Attendance & Co-Curriculum Management</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-slide-up">
              Simplify Your{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                School Management
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: '100ms' }}>
              Track student attendance, manage co-curriculum activities, and
              generate reports—all in one intuitive platform.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate('/login')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => navigate('/login')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="animate-slide-up"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-card/50 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 EduTrack. Attendance & Co-Curriculum Management System.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
