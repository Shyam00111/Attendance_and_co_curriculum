import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Trash2, CheckCircle2, AlertCircle, Gift, Trophy, BookMarked } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/';

const NotificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.get(
        `${BACKEND_URL}notifications/${user?.id}?read=${filter === 'unread' ? 'false' : undefined}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.get(
        `${BACKEND_URL}notifications/${user?.id}/unread`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      await axios.put(
        `${BACKEND_URL}notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      await axios.put(
        `${BACKEND_URL}notifications/${user?.id}/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
      fetchUnreadCount();
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      await axios.delete(
        `${BACKEND_URL}notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchNotifications();
      fetchUnreadCount();
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        const token = localStorage.getItem('attendance_app_token');
        await axios.delete(
          `${BACKEND_URL}notifications/${user?.id}/clear-all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchNotifications();
        fetchUnreadCount();
        toast({
          title: 'Success',
          description: 'All notifications cleared',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to clear notifications',
          variant: 'destructive',
        });
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'activity':
        return <Trophy className="w-5 h-5 text-green-500" />;
      case 'certificate':
        return <Gift className="w-5 h-5 text-purple-500" />;
      case 'announcement':
        return <Bell className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const displayedNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-600 mt-2">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
          >
            All ({notifications.length})
          </Button>
          <Button
            onClick={() => setFilter('unread')}
            variant={filter === 'unread' ? 'default' : 'outline'}
          >
            Unread ({unreadCount})
          </Button>
          {notifications.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="ml-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Loading notifications...
              </CardContent>
            </Card>
          ) : displayedNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            displayedNotifications.map((notification) => (
              <Card
                key={notification._id}
                className={`transition-all ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          onClick={() => handleMarkAsRead(notification._id)}
                          size="sm"
                          variant="ghost"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(notification._id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700">
              <strong>📌 Info:</strong> Enable email notifications in your account settings to receive alerts via email about attendance, activities, certificates, and announcements.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NotificationCenter;
