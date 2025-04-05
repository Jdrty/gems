import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trophy, MapPin, ChevronsUp, Clock, CalendarDays, Star } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Stats = () => {
  const { user } = useAuth();
  const { stats, loading, error } = useStats();
  const [activeTab, setActiveTab] = useState('overview');

  // Guest prompt content
  const GuestPrompt = () => (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Trophy className="h-12 w-12 text-primary" />
          <CardTitle>Track Your Exploration Progress</CardTitle>
          <CardDescription className="max-w-md">
            Create an account to track your visits, earn badges, and compete on leaderboards.
            You'll also get personalized recommendations based on your interests.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-muted-foreground">Loading stats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-destructive">Error loading stats: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistics & Achievements</h1>
      </div>

      {!user && <GuestPrompt />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{stats?.totalVisits || 0}</div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hidden Gems Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{stats?.hiddenGemsFound || 0}</div>
                  <Star className="h-4 w-4 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">{stats?.streak || 0} days</div>
                  <ChevronsUp className="h-4 w-4 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Visits by Month</CardTitle>
                <CardDescription>Your exploration activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.visitsByMonth || []} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem' 
                      }} 
                    />
                    <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Visits by Category</CardTitle>
                <CardDescription>Types of locations you've explored</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={stats?.visitsByCategory || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(stats?.visitsByCategory || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visits</CardTitle>
              <CardDescription>Your most recent location check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats?.recentVisits || []).map((visit, i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {visit.locationName}
                        {visit.isGem && <Star className="h-4 w-4 text-yellow-400" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{visit.area}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(visit.visitedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))}
                {(stats?.recentVisits || []).length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    No visits recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Achievements you've unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(stats?.badges || []).map((badge, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {badge.name === 'Explorer' && <MapPin className="h-4 w-4 text-primary" />}
                      {badge.name === 'Gem Hunter' && <Star className="h-4 w-4 text-yellow-400" />}
                      {badge.name === 'Consistent' && <ChevronsUp className="h-4 w-4 text-green-400" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {format(new Date(badge.earnedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {(stats?.badges || []).length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-4">
                    No badges earned yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stats; 