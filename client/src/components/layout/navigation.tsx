import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Home, Gamepad2, User, LogOut, Settings } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/betting", icon: Gamepad2, label: "Betting" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", icon: Settings, label: "Admin" });
  }

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard">
            <div className="text-xl font-bold text-white cursor-pointer">
              ShweMinthar 2D3D
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Link key={item.href} href={item.href}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                  </Link>
                </Button>
              
            ))}

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileBottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/betting", icon: Gamepad2, label: "Betting" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (user?.isAdmin) {
    navItems.push({ href: "/admin", icon: Settings, label: "Admin" });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center py-2 px-1 ${location === item.href ? 'text-blue-600' : 'text-gray-600'}`}>
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}