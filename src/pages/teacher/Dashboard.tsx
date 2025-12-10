import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, Brain, User, LogOut, Users } from 'lucide-react';

export default function TeacherDashboard() {
  const { user, userRole, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || userRole !== 'teacher')) {
      navigate('/auth');
    }
  }, [user, userRole, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const menuItems = [
    { icon: BarChart3, title: 'Analytics', description: 'View student performance', path: '/teacher/analytics' },
    { icon: Brain, title: 'Quizzes', description: 'Create and manage quizzes', path: '/teacher/quizzes' },
    { icon: FileText, title: 'Materials', description: 'Upload study resources', path: '/teacher/materials' },
    { icon: Users, title: 'Students', description: 'View student progress', path: '/teacher/students' },
    { icon: User, title: 'Profile', description: 'Manage your account', path: '/teacher/profile' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-display font-bold text-gradient">EduBot Teacher</h1>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Teacher Dashboard</h2>
          <p className="text-muted-foreground">Manage your classes and track student progress</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card 
              key={item.path} 
              className="glass-card hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl gradient-teacher flex items-center justify-center mb-2">
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
