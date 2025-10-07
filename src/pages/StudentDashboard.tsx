import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BookOpen, Brain, Trophy, TrendingUp } from 'lucide-react';
import { QuizQuestion } from '@/types/database';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadSubjects();
  };

  const loadSubjects = async () => {
    const { data } = await supabase
      .from('quiz_questions')
      .select('subject')
      .order('subject');
    
    if (data) {
      const uniqueSubjects = [...new Set(data.map(q => q.subject))];
      setSubjects(uniqueSubjects);
    }
  };

  const startQuiz = async (subject: string) => {
    setSelectedSubject(subject);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);

    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('subject', subject);

    if (data) {
      setQuestions(data.map(q => ({
        ...q,
        options: JSON.parse(q.options as string)
      })));
    }
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQuestion.id]: answer });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);

    // Save result
    if (user) {
      supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          subject: selectedSubject,
          score: correct,
          total_questions: questions.length,
          answers: answers
        })
        .then(() => toast.success('Quiz results saved!'));
    }
  };

  const getRecommendation = () => {
    const percentage = (score / questions.length) * 100;
    
    if (percentage >= 80) {
      return {
        title: 'Excellent Performance!',
        programs: ['AI & Data Science', 'Computer Science', 'Engineering'],
        message: 'You show strong aptitude in this area. Consider advanced programs!'
      };
    } else if (percentage >= 60) {
      return {
        title: 'Good Progress',
        programs: ['Information Technology', 'Business Analytics', 'Applied Sciences'],
        message: 'You\'re on the right track. Focus on building more skills.'
      };
    } else {
      return {
        title: 'Keep Learning',
        programs: ['Foundation Programs', 'Skill Development Courses'],
        message: 'Consider strengthening your fundamentals in this subject.'
      };
    }
  };

  if (!selectedSubject) {
    return (
      <DashboardLayout title="Student Dashboard">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-2 bg-gradient-to-br from-chart-1/10 to-chart-1/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-chart-1" />
                  Quizzes Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-chart-2" />
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">--%</p>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subject Quizzes</CardTitle>
              <CardDescription>Select a subject to start your assessment</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <Button
                  key={subject}
                  variant="outline"
                  className="h-24 flex flex-col gap-2"
                  onClick={() => startQuiz(subject)}
                >
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="font-semibold">{subject}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (showResults) {
    const recommendation = getRecommendation();
    const percentage = (score / questions.length) * 100;

    return (
      <DashboardLayout title="Quiz Results">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {selectedSubject} Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-primary mb-4">
                  <span className="text-4xl font-bold text-primary-foreground">
                    {score}/{questions.length}
                  </span>
                </div>
                <p className="text-xl font-semibold">Score: {percentage.toFixed(0)}%</p>
                <Progress value={percentage} className="mt-4" />
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{recommendation.message}</p>
                  <div>
                    <p className="font-semibold mb-2">Recommended Programs:</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.programs.map(program => (
                        <Badge key={program} variant="secondary">{program}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => setSelectedSubject(null)} variant="outline" className="flex-1">
                  Back to Subjects
                </Button>
                <Button onClick={() => startQuiz(selectedSubject)} className="flex-1">
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <DashboardLayout title={`${selectedSubject} Quiz`}>
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-32" />
            </div>
            <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion && currentQuestion.options.map((option: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto py-4 text-left"
                onClick={() => handleAnswer(option)}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
