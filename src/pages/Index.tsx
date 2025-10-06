import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      navigate(`/${currentUser.role}-dashboard`);
    }
  }, [currentUser, navigate]);

  const roles = [
    {
      icon: BookOpen,
      title: 'Student',
      description: 'Take quizzes and discover your ideal career path',
      color: 'from-primary to-primary-glow',
    },
    {
      icon: GraduationCap,
      title: 'Graduate',
      description: 'Get job matches and skill recommendations',
      color: 'from-secondary to-accent',
    },
    {
      icon: Users,
      title: 'Mentor',
      description: 'Guide graduates and provide feedback',
      color: 'from-accent to-primary',
    },
    {
      icon: Award,
      title: 'Admin',
      description: 'Manage data and view analytics',
      color: 'from-chart-4 to-chart-5',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-primary p-6 rounded-3xl shadow-lg">
              <Target className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Career Advisor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for career guidance, skill development, and job readiness
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2">
              <TrendingUp className="h-5 w-5" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <Card
              key={role.title}
              className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate('/login')}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-3`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full">
                  Learn More →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="bg-chart-1/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-chart-1" />
            </div>
            <h3 className="font-semibold text-lg">Skill Assessment</h3>
            <p className="text-muted-foreground text-sm">
              Interactive quizzes to identify your strengths
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="bg-chart-2/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-chart-2" />
            </div>
            <h3 className="font-semibold text-lg">AI Recommendations</h3>
            <p className="text-muted-foreground text-sm">
              Personalized career path suggestions
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="bg-chart-3/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
              <TrendingUp className="h-8 w-8 text-chart-3" />
            </div>
            <h3 className="font-semibold text-lg">Job Matching</h3>
            <p className="text-muted-foreground text-sm">
              Find the perfect roles based on your skills
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
