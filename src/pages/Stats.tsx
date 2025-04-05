import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Trophy, MapPin, ChevronsUp, Clock, CalendarDays, Star, BarChartIcon as ChartBar, Target, Award, Compass, TrendingUp, Flame, Medal, Crown, X } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#58CC02', '#FFC800', '#FF4B4B', '#1CB0F6', '#FF9600'];

const Stats = () => {
  const { user } = useAuth();
  const { stats, loading, error } = useStats();
  const [activeTab, setActiveTab] = useState('overview');
  const [chartVisible, setChartVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);

  useEffect(() => {
    // Trigger chart animations after component mounts
    const timer = setTimeout(() => {
      setChartVisible(true);
    }, 300);
    
    const animTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animTimer);
    };
  }, []);

  // Guest prompt content
  const GuestPrompt = () => (
    <div className="animate-fadeIn">
      <Card className="mb-8 bg-gradient-to-br from-[#58CC02]/5 to-[#1CB0F6]/5 overflow-hidden relative">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="animate-scaleIn relative">
              <div className="absolute inset-0 bg-[#58CC02]/10 rounded-full blur-xl"></div>
              <Trophy className="h-12 w-12 text-[#58CC02] relative z-10" />
            </div>
            <div className="animate-slideUp delay-300">
              <CardTitle>Track Your Exploration Progress</CardTitle>
            </div>
            <div className="animate-slideUp delay-400">
              <CardDescription className="max-w-md">
                Create an account to track your visits, earn badges, and compete on leaderboards.
                You'll also get personalized recommendations based on your interests.
              </CardDescription>
            </div>
          </div>
        </CardContent>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#1CB0F6]/10 rounded-full blur-xl"></div>
      </Card>
    </div>
  );

  const StatPopover = ({ title, children, isOpen, onClose }: { title: string; children: React.ReactNode; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-zinc-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{title}</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="animate-fadeIn flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#58CC02]/10 rounded-full blur-xl"></div>
            <div className="relative z-10 w-16 h-16 rounded-full border-4 border-t-[#58CC02] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <div className="text-lg text-muted-foreground animate-pulse">Loading your stats...</div>
          <div className="text-sm text-muted-foreground/60">This may take a moment</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="animate-fadeIn flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/10 rounded-full blur-xl"></div>
            <div className="relative z-10 w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="inline-block w-4 h-4 rounded-full bg-destructive animate-pulse"></span>
            </div>
          </div>
          <div className="text-lg text-destructive">Error loading stats</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <div className="animate-slideDown flex items-center gap-3 mb-6">
        <div className="animate-rotate">
          <ChartBar className="h-8 w-8 text-[#58CC02]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
      </div>

      {!user && <GuestPrompt />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="animate-slideUp">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="visits">Visit History</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-cardEntrance" style={{ animationDelay: '0ms' }}>
              <Card 
                className="bg-gradient-to-br from-[#FFC800]/5 to-[#FF9600]/5 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                onClick={() => setActivePopover('gems')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#FFC800]" />
                    Hidden Gems Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold animate-countUp">
                      {stats?.hiddenGemsFound || 0}
                    </div>
                    <Target className="h-4 w-4 text-[#FFC800]" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-cardEntrance" style={{ animationDelay: '100ms' }}>
              <Card 
                className="bg-gradient-to-br from-[#FF4B4B]/5 to-[#FF9600]/5 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                onClick={() => setActivePopover('streak')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[#FF4B4B]" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold animate-countUp" style={{ animationDelay: '200ms' }}>
                      {stats?.streak || 0} days
                    </div>
                    <ChevronsUp className="h-4 w-4 text-[#FF4B4B]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-cardEntrance" style={{ animationDelay: '400ms' }}>
              <Card 
                className="bg-gradient-to-br from-[#FF9600]/5 to-[#FFC800]/5 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                onClick={() => setActivePopover('activeDay')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#FF9600]" />
                    Most Active Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold animate-countUp" style={{ animationDelay: '800ms' }}>
                      {stats?.weeklyActivity?.reduce((max, day) => day.visits > max.visits ? day : max)?.day || 'N/A'}
                    </div>
                    <TrendingUp className="h-4 w-4 text-[#FF9600]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-cardEntrance" style={{ animationDelay: '500ms' }}>
              <Card 
                className="bg-gradient-to-br from-[#FF4B4B]/5 to-[#FF9600]/5 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
                onClick={() => setActivePopover('category')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Medal className="h-4 w-4 text-[#FF4B4B]" />
                    Favorite Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold animate-countUp" style={{ animationDelay: '1000ms' }}>
                      {stats?.visitsByCategory?.reduce((max, cat) => cat.value > max.value ? cat : max)?.name || 'N/A'}
                    </div>
                    <Crown className="h-4 w-4 text-[#FF4B4B]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="animate-cardEntrance" style={{ animationDelay: '300ms' }}>
              <Card className="col-span-1 hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle>Exploration Activity</CardTitle>
                  <CardDescription>Your visits over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={chartVisible ? stats?.visitsByMonth || [] : []} 
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#58CC02" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#58CC02" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                        animationDuration={300}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visits" 
                        stroke="#58CC02" 
                        fillOpacity={1} 
                        fill="url(#colorVisits)" 
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="animate-cardEntrance" style={{ animationDelay: '400ms' }}>
              <Card className="col-span-1 hover:shadow-md transition-all duration-300">
                <CardHeader>
                  <CardTitle>Visit Categories</CardTitle>
                  <CardDescription>Types of locations you've explored</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <Pie
                        data={chartVisible ? stats?.visitsByCategory || [] : []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {(stats?.visitsByCategory || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                        animationDuration={300}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="animate-cardEntrance" style={{ animationDelay: '500ms' }}>
            <Card className="hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your exploration patterns throughout the week</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartVisible ? stats?.weeklyActivity || [] : []} 
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                      animationDuration={300}
                    />
                    <Bar 
                      dataKey="visits" 
                      fill="#58CC02" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={true}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="visits" className="space-y-4">
          <div className="animate-fadeIn">
            <Card className="hover:shadow-mdtransition-all duration-300">
              <CardHeader>
                <CardTitle>Recent Visits</CardTitle>
                <CardDescription>Your most recent location check-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.recentVisits || []).map((visit, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex justify-between items-center border-b pb-3 last:border-0 last:pb-0 hover:bg-zinc-700 p-2 rounded-lg transition-all duration-300 hover:translate-x-1",
                        "animate-listItemEntrance"
                      )}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {visit.locationName}
                          {visit.isGem && (
                            <div className="animate-spin-slow">
                              <Star className="h-4 w-4 text-[#FFC800]" />
                            </div>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{visit.area}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(visit.visitedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                  {(stats?.recentVisits || []).length === 0 && (
                    <div className="animate-fadeIn text-center text-muted-foreground py-4">
                      No visits recorded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <div className="animate-fadeIn">
            <Card className="hover:shadow-md transition-all duration-300">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Achievements you've unlocked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(stats?.badges || []).map((badge, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm",
                        "animate-cardEntrance"
                      )}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="p-2 bg-[#58CC02]/10 rounded-full animate-pulse-slow">
                        {badge.name === 'Explorer' && <MapPin className="h-4 w-4 text-[#58CC02]" />}
                        {badge.name === 'Gem Hunter' && <Star className="h-4 w-4 text-[#FFC800]" />}
                        {badge.name === 'Consistent' && <ChevronsUp className="h-4 w-4 text-[#FF4B4B]" />}
                        {badge.name === 'Master Explorer' && <Crown className="h-4 w-4 text-[#1CB0F6]" />}
                        {badge.name === 'Area Expert' && <Medal className="h-4 w-4 text-[#FF9600]" />}
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
                    <div className="animate-fadeIn col-span-full text-center text-muted-foreground py-4">
                      No badges earned yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <StatPopover 
        title="Hidden Gems Found" 
        isOpen={activePopover === 'gems'} 
        onClose={() => setActivePopover(null)}
      >
        {(stats?.recentVisits || [])
          .filter(visit => visit.isGem)
          .map((visit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-[#FFC800]" />
              <span>{visit.locationName}</span>
            </div>
          ))}
      </StatPopover>

      <StatPopover 
        title="Current Streak" 
        isOpen={activePopover === 'streak'} 
        onClose={() => setActivePopover(null)}
      >
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#FF4B4B]" />
            <span>Current streak: {stats?.streak || 0} days</span>
          </div>
          <div className="text-muted-foreground">
            Last visit: {stats?.recentVisits?.[0] ? format(new Date(stats.recentVisits[0].visitedAt), 'MMM d, yyyy') : 'No visits yet'}
          </div>
        </div>
      </StatPopover>

      <StatPopover 
        title="Areas Explored" 
        isOpen={activePopover === 'areas'} 
        onClose={() => setActivePopover(null)}
      >
        {Array.from(new Set(stats?.recentVisits?.map(visit => visit.area) || []))
          .map((area, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-[#1CB0F6]" />
              <span>{area}</span>
            </div>
          ))}
      </StatPopover>

      <StatPopover 
        title="Total Visits" 
        isOpen={activePopover === 'visits'} 
        onClose={() => setActivePopover(null)}
      >
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#58CC02]" />
            <span>Total visits: {stats?.totalVisits || 0}</span>
          </div>
          <div className="text-muted-foreground">
            First visit: {stats?.recentVisits?.[stats.recentVisits.length - 1] ? format(new Date(stats.recentVisits[stats.recentVisits.length - 1].visitedAt), 'MMM d, yyyy') : 'No visits yet'}
          </div>
        </div>
      </StatPopover>

      <StatPopover 
        title="Most Active Day" 
        isOpen={activePopover === 'activeDay'} 
        onClose={() => setActivePopover(null)}
      >
        <div className="text-sm space-y-2">
          {stats?.weeklyActivity?.map((day, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span>{day.day}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF9600] rounded-full transition-all duration-300"
                    style={{ width: `${(day.visits / (stats.weeklyActivity?.reduce((max, d) => d.visits > max.visits ? d : max)?.visits || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground">{day.visits}</span>
              </div>
            </div>
          ))}
        </div>
      </StatPopover>

      <StatPopover 
        title="Favorite Category" 
        isOpen={activePopover === 'category'} 
        onClose={() => setActivePopover(null)}
      >
        <div className="text-sm space-y-2">
          {stats?.visitsByCategory?.map((category, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span>{category.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF4B4B] rounded-full transition-all duration-300"
                    style={{ width: `${(category.value / (stats.visitsByCategory?.reduce((max, c) => c.value > max.value ? c : max)?.value || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground">{category.value}</span>
              </div>
            </div>
          ))}
        </div>
      </StatPopover>
    </div>
  );
};

export default Stats;