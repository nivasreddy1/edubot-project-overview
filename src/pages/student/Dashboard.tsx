import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, Trophy, User, LogOut, Brain } from 'lucide-react';

export default function StudentDashboard() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || userRole !== 'student')) {
      navigate('/auth');
    }
  }, [user, userRole, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const menuItems = [
    { icon: MessageSquare, title: 'AI Chatbot', description: 'Ask questions and get help', path: '/student/chat' },
    { icon: Brain, title: 'Quizzes', description: 'Take or create AI quizzes', path: '/student/quizzes' },
    { icon: FileText, title: 'Materials', description: 'Access study resources', path: '/student/materials' },
    { icon: Trophy, title: 'Leaderboard', description: 'See your ranking', path: '/student/leaderboard' },
    { icon: User, title: 'Profile', description: 'Manage your account', path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-display font-bold text-gradient">EduBot Student</h1>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">What would you like to learn today?</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card 
              key={item.path} 
              className="glass-card hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl gradient-student flex items-center justify-center mb-2">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="font-display">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
