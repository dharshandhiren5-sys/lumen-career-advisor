import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Briefcase, Award, ExternalLink, TrendingUp } from 'lucide-react';

const GraduateDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [resumeText, setResumeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'graduate') {
      navigate('/login');
      return;
    }
    loadProfile();
    loadCertifications();
    loadInternships();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('graduate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setResumeText(data.resume_text || '');
      setExtractedSkills(data.extracted_skills || []);
      setJobMatches(Array.isArray(data.job_matches) ? data.job_matches : []);
    }
  };

  const loadCertifications = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .limit(5);
    if (data) setCertifications(data);
  };

  const loadInternships = async () => {
    const { data } = await supabase
      .from('internships')
      .select('*')
      .limit(5);
    if (data) setInternships(data);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    setAnalyzing(true);

    // Simple skill extraction (looking for common skills)
    const { data: allSkills } = await supabase.from('skills').select('*');
    
    if (allSkills) {
      const found = allSkills.filter(skill => 
        resumeText.toLowerCase().includes(skill.name.toLowerCase())
      ).map(s => s.name);

      setExtractedSkills(found);

      // Find matching jobs
      const { data: jobs } = await supabase.from('jobs').select('*');
      const matches = jobs?.filter(job => {
        const matchCount = job.required_skills.filter((s: string) => found.includes(s)).length;
        return matchCount > 0;
      }).map(job => ({
        ...job,
        match_percentage: (job.required_skills.filter((s: string) => found.includes(s)).length / job.required_skills.length) * 100
      })) || [];

      setJobMatches(matches as any);

      // Save profile
      if (user) {
        await supabase
          .from('graduate_profiles')
          .upsert({
            user_id: user.id,
            resume_text: resumeText,
            extracted_skills: found,
            job_matches: matches
          }, { onConflict: 'user_id' });
      }

      toast.success('Resume analyzed successfully!');
    }

    setAnalyzing(false);
  };

  const getMissingSkills = (job: any) => {
    return job.required_skills.filter((s: string) => !extractedSkills.includes(s));
  };

  return (
    <DashboardLayout title="Graduate Dashboard">
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-2 bg-gradient-to-br from-chart-1/10 to-chart-1/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-chart-1" />
                Skills Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{extractedSkills.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-chart-2" />
                Job Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{jobMatches.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-chart-3" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{certifications.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Analysis
            </CardTitle>
            <CardDescription>Paste your resume text for AI-powered skill extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your resume text here..."
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="font-mono text-sm"
            />
            <Button onClick={analyzeResume} disabled={analyzing} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {analyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>

            {extractedSkills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Extracted Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedSkills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {jobMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Matches
              </CardTitle>
              <CardDescription>Roles matching your skill profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobMatches.map(job => (
                <Card key={job.id} className="border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                      <Badge variant={job.match_percentage >= 70 ? 'default' : 'secondary'}>
                        {job.match_percentage.toFixed(0)}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Progress value={job.match_percentage} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {job.required_skills.filter((s: string) => extractedSkills.includes(s)).length} of {job.required_skills.length} skills matched
                      </p>
                    </div>
                    
                    {getMissingSkills(job).length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Skills to learn:</p>
                        <div className="flex flex-wrap gap-2">
                          {getMissingSkills(job).map((skill: string) => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommended Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifications.map(cert => (
                <div key={cert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground">{cert.platform}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={cert.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Internship Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {internships.map(intern => (
                <div key={intern.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{intern.title}</h4>
                    <p className="text-sm text-muted-foreground">{intern.platform}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={intern.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GraduateDashboard;
