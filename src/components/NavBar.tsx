
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MapPin, User, Home, LogOut, UserX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

const NavBar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isGuestMode, setGuestMode } = useApp();
  
  const navItems = [
    { name: 'Map', path: '/', icon: Home },
    { name: 'Profile', path: '/profile', icon: User, requiresAuth: true },
  ];

  const handleSignOut = async () => {
    if (isGuestMode) {
      setGuestMode(false);
      toast.success('Exited guest mode');
    } else {
      await signOut();
      toast.success('Signed out successfully');
    }
  };

  const filteredNavItems = navItems.filter(item => 
    !item.requiresAuth || user || (item.requiresAuth && isGuestMode === false)
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b h-16">
      <div className="container flex h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">CityTrove</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user || isGuestMode ? (
            <>
              <nav className="flex items-center space-x-6 mx-6">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-primary",
                      location.pathname === item.path 
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              <div className="flex items-center">
                {isGuestMode && (
                  <span className="mr-4 text-sm text-amber-500 font-medium flex items-center">
                    <UserX className="mr-1 h-4 w-4" />
                    Guest Mode
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                </Button>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <Button>
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
