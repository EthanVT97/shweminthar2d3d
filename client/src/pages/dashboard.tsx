
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletSummary from "@/components/dashboard/wallet-summary";
import RecentBets from "@/components/dashboard/recent-bets";
import ReferralCard from "@/components/dashboard/referral-card";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Welcome back, {user.username}!
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WalletSummary />
            <RecentBets />
          </div>
          
          <div className="space-y-6">
            <ReferralCard />
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Bets:</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-semibold">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Winnings:</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
