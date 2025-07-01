import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Minus } from "lucide-react";

export default function WalletSummary() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/transactions", {
        type: "deposit",
        amount,
        description: "Deposit request",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deposit request submitted for approval",
      });
      setDepositAmount("");
      setIsDepositOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit deposit request",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      return apiRequest("POST", "/api/transactions", {
        type: "withdrawal",
        amount,
        description: "Withdrawal request",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted for approval",
      });
      setWithdrawAmount("");
      setIsWithdrawOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (parseFloat(depositAmount) > 0) {
      depositMutation.mutate(depositAmount);
    }
  };

  const handleWithdraw = () => {
    if (parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= parseFloat(user?.balance || "0")) {
      withdrawMutation.mutate(withdrawAmount);
    } else {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Balance</span>
            <span className="font-semibold text-green-600">
              ₹{user?.balance || "0"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Commission</span>
            <span className="font-semibold text-green-600">
              ₹{user?.commission || "0"}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-1" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
                <Button
                  onClick={handleDeposit}
                  disabled={!depositAmount || depositMutation.isPending}
                  className="w-full"
                >
                  {depositMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Minus className="h-4 w-4 mr-1" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdrawal Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <Button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || withdrawMutation.isPending}
                  className="w-full"
                >
                  {withdrawMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
