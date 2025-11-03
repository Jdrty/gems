import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, Home, LogOut, UserX, BarChart2, Compass } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import { toast } from "sonner";
import gemsLogo from "@/assets/gems-logo.png";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isGuestMode, setGuestMode } = useApp();

  const logoLinkTarget = user ? "/" : "/auth";

  const navItems = [
    { name: "Map", path: "/", icon: Home },
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Stats", path: "/stats", icon: BarChart2 },
    { name: "Profile", path: "/profile", icon: User, requiresAuth: true },
  ];

  const handleSignOut = async () => {
    if (isGuestMode) {
      setGuestMode(false);
      toast.info("Sign in to save your progress");
      navigate("/auth");
      return;
    }

    try {
      await signOut();
      setGuestMode(true);
      toast.success("Signed out successfully. You're browsing in guest mode.");
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.requiresAuth || user || (item.requiresAuth && isGuestMode === false)
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b h-16">
      <div className="flex h-full items-center justify-between px-4">
        <Link to={logoLinkTarget} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={gemsLogo} alt="Gems logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-bold text-xl">Gems</span>
        </Link>

        <div className="flex items-center gap-4">
          {user || isGuestMode ? (
            <>
              <nav className="flex items-center space-x-6">
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
                  {isGuestMode ? "Log In" : "Sign Out"}
                </Button>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
