import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function ReferralCard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2 mt-1">
              <Input value={user?.referralCode || ''} readOnly />
              <Button size="sm" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Share your referral code and earn commission from your referrals' bets!
          </div>
          <div className="text-lg font-semibold">
            Commission Earned: {user?.commission || '0'} MMK
          </div>
        </div>
      </CardContent>
    </Card>
  );
}