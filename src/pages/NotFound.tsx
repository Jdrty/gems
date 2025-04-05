
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Location Not Found</h1>
        <p className="text-xl text-muted-foreground mb-6">
          It seems you've wandered off the map. This location doesn't exist in our city guide.
        </p>
        <Button asChild size="lg">
          <a href="/">Return to Exploration</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
