import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockActivities, activityCategories } from '@/data/mockData';
import { Activity } from '@/types';
import { Plus, Search, Filter, Calendar, User, Trophy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  // Load activities
  useEffect(() => {
    const storedActivities = localStorage.getItem('activity_records');
    const data: Activity[] = storedActivities
      ? JSON.parse(storedActivities)
      : mockActivities;

    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setActivities(data);
    setFilteredActivities(data);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, categoryFilter]);

  const handleDelete = (activityId: string) => {
    const updatedActivities = activities.filter((a) => a.id !== activityId);
    setActivities(updatedActivities);
    localStorage.setItem('activity_records', JSON.stringify(updatedActivities));
    toast({
      title: "Activity deleted",
      description: "The activity has been removed.",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sports: 'bg-success/10 text-success',
      Academic: 'bg-primary/10 text-primary',
      Arts: 'bg-accent text-accent-foreground',
      'Community Service': 'bg-warning/10 text-warning',
      Leadership: 'bg-destructive/10 text-destructive',
      Cultural: 'bg-secondary text-secondary-foreground',
      Technology: 'bg-muted text-muted-foreground',
      Other: 'bg-muted text-muted-foreground',
    };
    return colors[category] || colors.Other;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Co-Curriculum Activities
            </h1>
            <p className="mt-1 text-muted-foreground">
              Browse and manage student activities
            </p>
          </div>
          <Link to="/activity/add">
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {activityCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchTerm || categoryFilter !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              >
                Clear
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Activity Grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity, index) => (
              <Card
                key={activity.id}
                className="animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getCategoryColor(activity.category)}>
                      {activity.category}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{activity.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(activity.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2 text-lg">
                    {activity.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activity.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {activity.studentName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {activity.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                No activities found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first activity to get started'}
              </p>
              {!searchTerm && categoryFilter === 'all' && (
                <Link to="/activity/add" className="mt-4">
                  <Button variant="hero">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActivityList;
