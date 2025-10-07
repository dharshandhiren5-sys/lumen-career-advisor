import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role) {
      navigate(`/${currentUser.role}-dashboard`);
    } else {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

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
            <div className="bg-gradient-primary p-6 rounded-3xl shadow-2xl animate-pulse">
              <Target className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Career Advisor
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for career guidance, skill development, and job readiness
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/login')} className="gap-2 shadow-lg hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="shadow hover:scale-105 transition-transform">
              Sign In
            </Button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {roles.map((role, index) => (
            <Card
              key={role.title}
              className="border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer animate-scale-in hover:border-primary/50"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate('/login')}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <role.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full hover:bg-primary/10">
                  Learn More →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-10 mb-16">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="bg-gradient-to-br from-chart-1 to-chart-1/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-bold text-xl">Skill Assessment</h3>
            <p className="text-muted-foreground">
              Interactive quizzes to identify your strengths and potential career paths
            </p>
          </div>
          <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="bg-gradient-to-br from-chart-2 to-chart-2/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <Target className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-bold text-xl">AI Recommendations</h3>
            <p className="text-muted-foreground">
              Personalized career path suggestions based on your unique profile
            </p>
          </div>
          <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-gradient-to-br from-chart-3 to-chart-3/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h3 className="font-bold text-xl">Job Matching</h3>
            <p className="text-muted-foreground">
              Find the perfect roles that match your skills and aspirations
            </p>
          </div>
        </div>

        {/* Dataset Attribution */}
        <Card className="border-2 bg-gradient-to-br from-muted/50 to-muted/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Powered by Comprehensive Career Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Our platform utilizes curated datasets from leading job platforms, certification providers, and industry experts
              to deliver accurate career guidance and skill recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
              <Badge variant="secondary">15+ Skills Domains</Badge>
              <Badge variant="secondary">100+ Job Roles</Badge>
              <Badge variant="secondary">Verified Certifications</Badge>
              <Badge variant="secondary">Real Internships</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
