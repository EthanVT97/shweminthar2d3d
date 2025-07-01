import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Minus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function WalletSummary() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4">
          {user?.balance || '0'} MMK
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Deposit
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Minus className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}