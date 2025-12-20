import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Send, MessageCircle, Loader2, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_Backend_Url;

  // Fetch suggestions on load
  useEffect(() => {
    fetchSuggestions();
    // Welcome message
    const welcomeMsg: Message = {
      id: 'welcome-' + Date.now(),
      type: 'bot',
      text: `👋 Hello${user ? ', ' + user.name : ''}! I'm the EduTrack Assistant. I can help you with attendance, curriculum, students, activities, certificates, and more. How can I assist you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('attendance_app_token');
      const role = user?.role || 'default';
      const response = await axios.get(`${BACKEND_URL}chatbot/suggestions/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: 'user-' + Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('attendance_app_token');
      const response = await axios.post(`${BACKEND_URL}chatbot/message`, {
        message: inputValue,
        userId: user?.id,
        role: user?.role
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const botMessage: Message = {
          id: 'bot-' + Date.now(),
          type: 'bot',
          text: response.data.data.botResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response from chatbot',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleClearChat = () => {
    const welcomeMsg: Message = {
      id: 'welcome-' + Date.now(),
      type: 'bot',
      text: `🔄 Chat cleared! How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            EduTrack Assistant
          </h1>
          <p className="mt-1 text-muted-foreground">
            Ask me anything about attendance, curriculum, students, activities, or features
          </p>
        </div>

        {/* Chat Container */}
        <Card className="flex h-[600px] flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-4">
                  <MessageCircle className="mx-auto h-12 w-12 opacity-20" />
                  <p className="text-muted-foreground">
                    No messages yet. Start by asking a question or click a suggestion below.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                      <span className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted px-4 py-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          {/* Suggestions */}
          {messages.length <= 1 && suggestions.length > 0 && (
            <div className="border-t px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t px-4 py-3 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleClearChat}
                variant="outline"
                size="icon"
                title="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Press Enter to send messages. Click suggestions to populate the input.
            </p>
          </div>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">❓ What can I help with?</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-sm">📊 Attendance</p>
              <p className="text-xs text-muted-foreground">Mark attendance, view reports, attendance rates</p>
            </div>
            <div>
              <p className="font-semibold text-sm">📚 Curriculum</p>
              <p className="text-xs text-muted-foreground">Create subjects, add topics, track progress</p>
            </div>
            <div>
              <p className="font-semibold text-sm">👥 Students</p>
              <p className="text-xs text-muted-foreground">Add students, manage enrollment, view records</p>
            </div>
            <div>
              <p className="font-semibold text-sm">🏆 Activities</p>
              <p className="text-xs text-muted-foreground">Record activities, achievements, events</p>
            </div>
            <div>
              <p className="font-semibold text-sm">📜 Certificates</p>
              <p className="text-xs text-muted-foreground">Upload certificates, manage proofs</p>
            </div>
            <div>
              <p className="font-semibold text-sm">🔐 Account & Roles</p>
              <p className="text-xs text-muted-foreground">Login, permissions, role-based features</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Chatbot;
