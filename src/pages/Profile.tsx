import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { User, UserX, LogOut, UserPlus, Mail, Calendar, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Profile = () => {
  const { loading, isGuestMode } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isGuestMode) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-col items-center text-center gap-4 py-12">
          <div className="bg-amber-500/20 p-4 rounded-full">
            <UserX className="h-16 w-16 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold">Guest Mode</h1>
          <p className="text-muted-foreground mb-4 max-w-md">
            You're currently in guest mode. Your visited locations won't be saved when you leave. 
            Sign in to track your exploration progress.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sign In or Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      </div>

      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user?.email?.split('@')[0] || 'User'}</CardTitle>
                  <CardDescription className="text-base">{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="pl-6">{user?.email}</p>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Member since</span>
                  </div>
                  <p className="pl-6">{new Date(user?.created_at || '').toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                
                <Separator />
                
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Account Status</span>
                  </div>
                  <p className="pl-6">Active</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="default" className="gap-2 w-full">
                  <UserPlus className="h-4 w-4" />
                  Change Account
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
