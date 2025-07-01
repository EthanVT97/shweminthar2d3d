import { useQuery } from "@tanstack/react-query";
import Navigation, { MobileBottomNavigation } from "@/components/layout/navigation";
import BetForm from "@/components/betting/bet-form";
import WalletSummary from "@/components/dashboard/wallet-summary";
import RecentBets from "@/components/dashboard/recent-bets";
import ReferralCard from "@/components/dashboard/referral-card";

export default function Betting() {
  const { data: resultData } = useQuery({
    queryKey: ["/api/results/today"],
  });

  const result = resultData?.result;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Results */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Today's Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">2D Result</h3>
                <div className="text-4xl font-bold">
                  {result?.result2d || "--"}
                </div>
                <div className="text-sm opacity-75">Morning: 11:00 AM</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">3D Result</h3>
                <div className="text-4xl font-bold">
                  {result?.result3d || "---"}
                </div>
                <div className="text-sm opacity-75">Evening: 4:30 PM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Betting Interface */}
          <div className="lg:col-span-2">
            <BetForm />
          </div>

          {/* User Dashboard */}
          <div className="space-y-6">
            <WalletSummary />
            <RecentBets />
            <ReferralCard />
          </div>
        </div>
      </div>

      <MobileBottomNavigation />
    </div>
  );
}
