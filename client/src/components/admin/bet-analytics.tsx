import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

export default function BetAnalytics() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: betsData } = useQuery({
    queryKey: ["/api/admin/bets", selectedDate],
    queryFn: () => fetch(`/api/admin/bets?date=${selectedDate}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    }).then(res => res.json()),
  });

  const stats = statsData?.stats || {};
  const bets = betsData?.bets || [];

  const exportToCSV = () => {
    const csvContent = [
      ["User ID", "Type", "Number", "Amount", "Status", "Time"],
      ...bets.map((bet: any) => [
        bet.userId,
        bet.type,
        bet.number,
        bet.amount,
        bet.status,
        new Date(bet.createdAt).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bets-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Betting Analytics</CardTitle>
          <div className="flex space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalBets || 0}
            </div>
            <div className="text-sm text-blue-600">Total Bets</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ₹{parseFloat(stats.totalAmount || "0").toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Amount</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              ₹{parseFloat(stats.totalWinnings || "0").toLocaleString()}
            </div>
            <div className="text-sm text-yellow-600">Total Winnings</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₹{parseFloat(stats.netProfit || "0").toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">Net Profit</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">User ID</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Number</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet: any) => (
                <tr key={bet.id} className="border-b">
                  <td className="py-2">{bet.userId}</td>
                  <td className="py-2">{bet.type}</td>
                  <td className="py-2 font-mono">{bet.number}</td>
                  <td className="py-2">₹{bet.amount}</td>
                  <td className="py-2">
                    <Badge className={getStatusColor(bet.status)}>
                      {bet.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-sm text-gray-500">
                    {new Date(bet.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bets.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No bets found for selected date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
