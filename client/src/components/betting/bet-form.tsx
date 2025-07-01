import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import NumberPad from "./number-pad";
import { Ticket } from "lucide-react";

const betSchema = z.object({
  number: z.string().min(2, "Please select a number"),
  amount: z.string().min(1, "Please enter bet amount"),
  type: z.enum(["2D", "3D"]),
});

type BetFormData = z.infer<typeof betSchema>;

export default function BetForm() {
  const [betType, setBetType] = useState<"2D" | "3D">("2D");
  const [selectedNumbers, setSelectedNumbers] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      number: "",
      amount: "",
      type: "2D",
    },
  });

  const placeBetMutation = useMutation({
    mutationFn: async (data: BetFormData) => {
      const odds = data.type === "2D" ? 85 : 500;
      const potentialPayout = parseFloat(data.amount) * odds;
      
      return apiRequest("POST", "/api/bets", {
        ...data,
        potentialPayout: potentialPayout.toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bet placed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedNumbers("");
    form.reset();
  };

  const handleNumberSelect = (number: string) => {
    const maxLength = betType === "2D" ? 2 : 3;
    if (selectedNumbers.length < maxLength) {
      const newNumbers = selectedNumbers + number;
      setSelectedNumbers(newNumbers);
      form.setValue("number", newNumbers);
    }
  };

  const handleClear = () => {
    const newNumbers = selectedNumbers.slice(0, -1);
    setSelectedNumbers(newNumbers);
    form.setValue("number", newNumbers);
  };

  const handleRandom = () => {
    const maxNumber = betType === "2D" ? 99 : 999;
    const randomNum = Math.floor(Math.random() * (maxNumber + 1));
    const formattedNum = randomNum.toString().padStart(betType === "2D" ? 2 : 3, "0");
    setSelectedNumbers(formattedNum);
    form.setValue("number", formattedNum);
  };

  const handleBetTypeChange = (type: "2D" | "3D") => {
    setBetType(type);
    setSelectedNumbers("");
    form.setValue("type", type);
    form.setValue("number", "");
  };

  const handleAmountSelect = (amount: number) => {
    form.setValue("amount", amount.toString());
  };

  const onSubmit = (data: BetFormData) => {
    placeBetMutation.mutate(data);
  };

  const calculatePayout = () => {
    const amount = parseFloat(form.watch("amount") || "0");
    const odds = betType === "2D" ? 85 : 500;
    return amount * odds;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Place Your Bet</CardTitle>
        <div className="flex space-x-4">
          <Button
            onClick={() => handleBetTypeChange("2D")}
            className={betType === "2D" ? "" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            variant={betType === "2D" ? "default" : "secondary"}
          >
            2D Betting
          </Button>
          <Button
            onClick={() => handleBetTypeChange("3D")}
            className={betType === "3D" ? "" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
            variant={betType === "3D" ? "default" : "secondary"}
          >
            3D Betting
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormLabel>Select Numbers</FormLabel>
              <NumberPad
                selectedNumbers={selectedNumbers}
                betType={betType}
                onNumberSelect={handleNumberSelect}
                onClear={handleClear}
                onRandom={handleRandom}
              />
            </div>

            <div>
              <FormLabel>Bet Amount</FormLabel>
              <div className="flex space-x-3 mb-3">
                {[100, 500, 1000, 5000].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    variant="outline"
                    className="bg-gray-100 hover:bg-gray-200"
                  >
                    ₹{amount.toLocaleString()}
                  </Button>
                ))}
              </div>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter custom amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Potential Payout:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{calculatePayout().toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {betType} odds: 1:{betType === "2D" ? "85" : "500"}
              </div>
            </div>

            <FormField
              control={form.control}
              name="number"
              render={() => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...form.register("number")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={() => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...form.register("type")} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={placeBetMutation.isPending || !selectedNumbers || !form.watch("amount")}
            >
              <Ticket className="h-4 w-4 mr-2" />
              {placeBetMutation.isPending ? "Placing Bet..." : "Place Bet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
