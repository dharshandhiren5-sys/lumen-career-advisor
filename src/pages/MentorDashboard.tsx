import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, MessageSquare, Star } from 'lucide-react';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [graduates, setGraduates] = useState<any[]>([]);
  const [selectedGraduate, setSelectedGraduate] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(75);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'mentor') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadGraduates();
  };

  const loadGraduates = async () => {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'graduate');

    if (users) {
      const graduatesWithProfiles = await Promise.all(
        users.map(async (grad) => {
          const { data: profile } = await supabase
            .from('graduate_profiles')
            .select('*')
            .eq('user_id', grad.id)
            .maybeSingle();

          return { ...grad, profile };
        })
      );

      setGraduates(graduatesWithProfiles);
    }
  };

  const submitFeedback = async () => {
    if (!selectedGraduate || !feedback.trim()) {
      toast.error('Please enter feedback');
      return;
    }

    if (!user) return;
    
    const { error } = await supabase
      .from('mentor_feedback')
      .insert({
        graduate_id: selectedGraduate.id,
        mentor_id: user.id,
        feedback: feedback,
        score: score
      });

    if (error) {
      toast.error('Failed to submit feedback');
    } else {
      toast.success('Feedback submitted successfully!');
      setFeedback('');
      setSelectedGraduate(null);
    }
  };

  if (selectedGraduate) {
    return (
      <DashboardLayout title="Provide Feedback">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{selectedGraduate.name}</CardTitle>
              <CardDescription>{selectedGraduate.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedGraduate.profile && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGraduate.profile.extracted_skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedGraduate.profile.resume_text && (
                    <div>
                      <h4 className="font-semibold mb-2">Resume:</h4>
                      <div className="p-4 bg-muted rounded-lg max-h-40 overflow-y-auto text-sm">
                        {selectedGraduate.profile.resume_text}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Performance Score (0-100)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-2xl font-bold text-primary">{score}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide constructive feedback for the graduate..."
                    rows={6}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setSelectedGraduate(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={submitFeedback} className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mentor Dashboard">
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 bg-gradient-to-br from-chart-1/10 to-chart-1/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-chart-1" />
                Graduates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{graduates.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-chart-2" />
                Feedback Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-chart-3" />
                Avg Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">--</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Graduate Profiles</CardTitle>
            <CardDescription>Select a graduate to provide feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {graduates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No graduates found</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {graduates.map(grad => (
                  <Card key={grad.id} className="border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedGraduate(grad)}>
                    <CardHeader>
                      <CardTitle className="text-lg">{grad.name}</CardTitle>
                      <CardDescription>{grad.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {grad.profile?.extracted_skills && grad.profile.extracted_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {grad.profile.extracted_skills.slice(0, 5).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                          {grad.profile.extracted_skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{grad.profile.extracted_skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills listed</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MentorDashboard;
