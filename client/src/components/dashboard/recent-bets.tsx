import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function RecentBets() {
  const { data: betsData, isLoading } = useQuery({
    queryKey: ["/api/bets"],
  });

  const bets = betsData?.bets || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "won":
        return "Won";
      case "lost":
        return "Lost";
      default:
        return "Pending";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bets</CardTitle>
      </CardHeader>
      <CardContent>
        {bets.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No bets placed yet
          </div>
        ) : (
          <div className="space-y-3">
            {bets.slice(0, 5).map((bet: any) => (
              <div key={bet.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{bet.type} - {bet.number}</div>
                  <div className="text-sm text-gray-500">₹{bet.amount} bet</div>
                </div>
                <div className="text-right">
                  {bet.status === "won" ? (
                    <div className="text-green-600 font-medium">+₹{bet.potentialPayout}</div>
                  ) : bet.status === "lost" ? (
                    <div className="text-red-600 font-medium">-₹{bet.amount}</div>
                  ) : (
                    <div className="text-yellow-600 font-medium">Pending</div>
                  )}
                  <Badge className={getStatusColor(bet.status)}>
                    {getStatusText(bet.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {bets.length > 5 && (
          <Button variant="ghost" className="w-full mt-4 text-primary">
            View All Bets <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentBets;
  );
}
