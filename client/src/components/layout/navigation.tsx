import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Wallet, History, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer">ShweMinthar 2D3D</h1>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/") ? "text-primary" : "text-gray-500 hover:text-gray-900"
                }`}>
                  Betting
              </Link>
              {user?.isAdmin && (
                <Link href="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/admin") ? "text-primary" : "text-gray-500 hover:text-gray-900"
                  }`}>
                    Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Balance: <span className="font-semibold text-green-600">₹{user?.balance || "0"}</span>
            </div>
            <Button onClick={logout} variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function MobileBottomNavigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="grid grid-cols-4 gap-1">
        <Link href="/" className={`flex flex-col items-center py-2 ${
            isActive("/") ? "text-primary" : "text-gray-400"
          }`}>
            <Wallet className="text-xl" />
            <span className="text-xs mt-1">Bet</span>
        </Link>

        <button className="flex flex-col items-center py-2 text-gray-400">
          <Wallet className="text-xl" />
          <span className="text-xs mt-1">Wallet</span>
        </button>

        <button className="flex flex-col items-center py-2 text-gray-400">
          <History className="text-xl" />
          <span className="text-xs mt-1">History</span>
        </button>

        <button className="flex flex-col items-center py-2 text-gray-400">
          <Users className="text-xl" />
          <span className="text-xs mt-1">Referral</span>
        </button>

        {user?.isAdmin && (
          <Link href="/admin" className={`flex flex-col items-center py-2 ${
              isActive("/admin") ? "text-primary" : "text-gray-400"
            }`}>
            <Shield className="text-xl" />
            <span className="text-xs mt-1">Admin</span>
          </Link>
        )}
      </div>
    </div>
  );
}
```