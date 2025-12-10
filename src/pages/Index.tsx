import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Bot, Brain, Trophy, Languages, Sparkles } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  const features = [
    { icon: Bot, title: 'AI Chatbot Tutor', description: 'Interactive learning with voice and text support' },
    { icon: Brain, title: 'Smart Quizzes', description: 'AI-generated adaptive quizzes based on your level' },
    { icon: Trophy, title: 'Gamification', description: 'Earn points, badges, and climb the leaderboard' },
    { icon: Languages, title: 'Multi-Language', description: 'Learn in English, Hindi, Tamil, or Telugu' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container relative z-10 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Education Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
              Meet <span className="text-gradient">EduBot</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">
                Your Intelligent Learning Assistant
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              EduBot uses advanced AI to provide personalized learning experiences for students 
              and powerful analytics for teachers. Transform the way you learn and teach.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="gradient-student text-lg h-14 px-8"
                onClick={() => navigate('/auth')}
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Student Login
              </Button>
              <Button 
                size="lg" 
                className="gradient-teacher text-lg h-14 px-8"
                onClick={() => navigate('/auth')}
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Teacher Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Powerful Features for Modern Learning
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for an effective and engaging educational experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="glass-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-display">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Role Cards */}
      <div className="container pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="h-2 gradient-student" />
            <CardHeader className="space-y-4">
              <div className="w-16 h-16 rounded-2xl gradient-student flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-display">For Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Access AI-powered tutoring, take adaptive quizzes, track your progress, 
                and get personalized learning recommendations.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Interactive AI Chatbot with voice support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  AI-generated adaptive quizzes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Study materials and resources
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Points, badges, and leaderboards
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="h-2 gradient-teacher" />
            <CardHeader className="space-y-4">
              <div className="w-16 h-16 rounded-2xl gradient-teacher flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-display">For Teachers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Visualize student performance, create and manage quizzes, upload study materials, 
                and get AI-powered insights.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Visual analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  AI quiz generation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Content management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Real-time student alerts
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold">EduBot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 EduBot. Empowering education through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
