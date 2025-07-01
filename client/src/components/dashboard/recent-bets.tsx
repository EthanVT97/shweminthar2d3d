
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Bet {
  id: number;
  type: string;
  number: string;
  amount: string;
  status: string;
  drawDate: string;
  potentialPayout: string;
}

export function RecentBets() {
  const { data: bets, isLoading } = useQuery({
    queryKey: ['/api/bets'],
    queryFn: async () => {
      const response = await fetch('/api/bets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bets');
      const data = await response.json();
      return data.bets as Bet[];
    }
  });

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
        {!bets || bets.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No bets placed yet
          </div>
        ) : (
          <div className="space-y-3">
            {bets.slice(0, 5).map((bet) => (
              <div key={bet.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{bet.type} - {bet.number}</div>
                  <div className="text-sm text-muted-foreground">
                    Amount: {bet.amount} MMK
                  </div>
                </div>
                <Badge variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}>
                  {bet.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
