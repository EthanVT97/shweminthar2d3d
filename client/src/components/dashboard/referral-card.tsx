import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Share2, Users, DollarSign } from "lucide-react";

export default function ReferralCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleShareReferral = () => {
    const referralUrl = `${window.location.origin}/register?ref=${user?.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join ShweMinthar 2D3D",
        text: "Join me on ShweMinthar 2D3D lottery platform!",
        url: referralUrl,
      });
    } else {
      navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
      <CardHeader>
        <CardTitle className="text-white">Referral Program</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-sm opacity-90">Your Referral Code</div>
            <div className="font-mono text-lg font-bold">{user?.referralCode}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm opacity-90">Commission</div>
              <div className="text-xl font-bold flex items-center">
                <DollarSign className="h-5 w-5 mr-1" />
                ₹{user?.commission || "0"}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">Earn ₹50</div>
              <div className="text-sm">per referral</div>
            </div>
          </div>
        </div>
        <Button
          onClick={handleShareReferral}
          className="w-full mt-4 bg-white text-yellow-600 hover:bg-gray-100"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Code
        </Button>
      </CardContent>
    </Card>
  );
}
