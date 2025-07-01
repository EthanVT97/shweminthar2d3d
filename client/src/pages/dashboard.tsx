import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/layout/navigation";
import { useAuth } from "@/hooks/use-auth";
import { WalletSummary } from "@/components/dashboard/wallet-summary";
import { RecentBets } from "@/components/dashboard/recent-bets";
import { ReferralCard } from "@/components/dashboard/referral-card";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      
        <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-white/80">
            Ready to place your lucky numbers?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <WalletSummary />
          <ReferralCard />
          <div className="md:col-span-2 lg:col-span-1">
            <RecentBets />
          </div>
        </div>
      </div>
    </div>
  );
}