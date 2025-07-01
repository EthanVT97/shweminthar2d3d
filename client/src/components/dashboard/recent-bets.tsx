import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function RecentBets() {
  // Mock data for now - will be replaced with real data from API
  const recentBets = [
    {
      id: 1,
      numbers: "123",
      type: "2D",
      amount: 1000,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      numbers: "456",
      type: "3D",
      amount: 2000,
      status: "won",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-500";
      case "lost":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Bets
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        {recentBets.length === 0 ? (
          <p className="text-center text-white/60 py-8">No bets placed yet</p>
        ) : (
          <div className="space-y-4">
            {recentBets.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-white border-white/20">
                    {bet.type}
                  </Badge>
                  <div>
                    <div className="font-semibold">{bet.numbers}</div>
                    <div className="text-sm text-white/60">
                      {new Date(bet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{bet.amount}</div>
                  <Badge className={getStatusColor(bet.status)}>
                    {bet.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}