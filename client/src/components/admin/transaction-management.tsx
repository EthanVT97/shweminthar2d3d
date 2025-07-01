import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, X } from "lucide-react";

export default function TransactionManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["/api/admin/transactions/pending"],
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/admin/transactions/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    updateTransactionMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    updateTransactionMutation.mutate({ id, status: "rejected" });
  };

  const transactions = transactionsData?.transactions || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Transactions</CardTitle>
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
        <CardTitle>Pending Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No pending transactions
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <div key={transaction.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium capitalize">
                      {transaction.type} Request
                    </div>
                    <div className="text-sm text-gray-500">
                      User ID: {transaction.userId} | ₹{transaction.amount}
                    </div>
                    {transaction.description && (
                      <div className="text-sm text-gray-400">
                        {transaction.description}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(transaction.id)}
                      disabled={updateTransactionMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(transaction.id)}
                      disabled={updateTransactionMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(transaction.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
