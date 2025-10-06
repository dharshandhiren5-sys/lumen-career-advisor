import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Database, Award, Briefcase, BarChart3, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    graduates: 0,
    mentors: 0,
    skills: 0,
    jobs: 0,
    certifications: 0,
    internships: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    // Load users
    const { data: allUsers } = await supabase.from('users').select('*');
    if (allUsers) {
      setUsers(allUsers);
      setStats(prev => ({
        ...prev,
        totalUsers: allUsers.length,
        students: allUsers.filter(u => u.role === 'student').length,
        graduates: allUsers.filter(u => u.role === 'graduate').length,
        mentors: allUsers.filter(u => u.role === 'mentor').length,
      }));
    }

    // Load skills
    const { data: allSkills } = await supabase.from('skills').select('*');
    if (allSkills) {
      setSkills(allSkills);
      setStats(prev => ({ ...prev, skills: allSkills.length }));
    }

    // Load jobs
    const { data: allJobs } = await supabase.from('jobs').select('*');
    if (allJobs) {
      setJobs(allJobs);
      setStats(prev => ({ ...prev, jobs: allJobs.length }));
    }

    // Load certifications
    const { data: certs } = await supabase.from('certifications').select('id');
    if (certs) {
      setStats(prev => ({ ...prev, certifications: certs.length }));
    }

    // Load internships
    const { data: interns } = await supabase.from('internships').select('id');
    if (interns) {
      setStats(prev => ({ ...prev, internships: interns.length }));
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) {
        loadData();
      }
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 bg-gradient-to-br from-chart-1/10 to-chart-1/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-chart-1" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-2/10 to-chart-2/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-chart-2" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.skills}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-3/10 to-chart-3/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-chart-3" />
                Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.jobs}</p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-chart-4/10 to-chart-4/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-chart-4" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.certifications + stats.internships}</p>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Students</p>
                <p className="text-2xl font-bold text-chart-1">{stats.students}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Graduates</p>
                <p className="text-2xl font-bold text-chart-2">{stats.graduates}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Mentors</p>
                <p className="text-2xl font-bold text-chart-3">{stats.mentors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage system data and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(u.id)}
                            disabled={u.role === 'admin'}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  {skills.map(skill => (
                    <div key={skill.id} className="p-3 border rounded-lg">
                      <h4 className="font-semibold">{skill.name}</h4>
                      <p className="text-sm text-muted-foreground">{skill.domain}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4">
                <div className="space-y-3">
                  {jobs.map(job => (
                    <Card key={job.id} className="border">
                      <CardHeader>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
