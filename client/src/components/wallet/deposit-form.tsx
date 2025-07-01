import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const depositSchema = z.object({
  type: z.literal("deposit"),
  amount: z.string().min(1, "Amount is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof depositSchema>;

interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  phone?: string;
  accountNumber?: string;
  bankName?: string;
}

export default function DepositForm() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      type: "deposit",
      amount: "",
      paymentMethodId: "",
      description: "",
    },
  });

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useQuery({
    queryKey: ["/api/payment-methods"],
  });

  const depositMutation = useMutation({
    mutationFn: async (data: DepositFormData) => {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("amount", data.amount);
      formData.append("paymentMethodId", data.paymentMethodId);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit deposit request');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "ေငြသြင္းေတာင္းဆိုမွုေအာင္ျမင္ခဲ့သည္",
        description: "ငြေသြင္းေတာင္းဆိုမှုကို အေကာင္အထည္ေဖၚရန္ အက္မင္စစ္ေဆးမွုကို ေစာင့္ဆိုင္းပါ။",
      });
      form.reset();
      setReceiptFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "မွားယြင္းမွု",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DepositFormData) => {
    if (!receiptFile) {
      toast({
        title: "မွားယြင္းမွု",
        description: "ငွေလႊဲေငြပါဘဲလွဲအျပေစာကို upload လုပ္ပါ",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(data);
  };

  const selectedPaymentMethod = paymentMethodsData?.paymentMethods?.find(
    (pm: PaymentMethod) => pm.id.toString() === form.watch("paymentMethodId")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>ငြေသြင္းရန္</CardTitle>
        <CardDescription>
          ငြေသြင္းရန္ ေအာက္ပါအခ်က္အလက္မ်ားကို ျဖည့္စြက္ပါ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ပမာဏ (MMK)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="10000" 
                      type="number" 
                      min="1000"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ေငြပေးေခ်မွုနည္းလမ္း</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="ေငြပေးေခ်မွုနည္းလမ္းကို ေရြးခ်ယ္ပါ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPaymentMethods ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        paymentMethodsData?.paymentMethods?.map((method: PaymentMethod) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.type.toUpperCase()} - {method.name}
                            {method.phone && ` (${method.phone})`}
                            {method.bankName && ` - ${method.bankName}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPaymentMethod && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">ေငြလႊဲရမည့္အေသးစိတ္</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>နာမည္:</strong> {selectedPaymentMethod.name}</p>
                  {selectedPaymentMethod.phone && (
                    <p><strong>ဖုန္းနံပါတ္:</strong> {selectedPaymentMethod.phone}</p>
                  )}
                  {selectedPaymentMethod.accountNumber && (
                    <p><strong>အေကာင့္နံပါတ္:</strong> {selectedPaymentMethod.accountNumber}</p>
                  )}
                  {selectedPaymentMethod.bankName && (
                    <p><strong>ဘဏ္:</strong> {selectedPaymentMethod.bankName}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <FormLabel>ငြေလႊဲေငြပါဘဲလွဲအျပေစာ</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReceiptFile(file);
                  }
                }}
                className="mt-2"
              />
              {receiptFile && (
                <p className="text-sm text-green-600 mt-1">
                  ေရြးခ်ယ္ျပီး: {receiptFile.name}
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>မွတ္ခ်က္ (ေရြးခ်ယ္ခြင့္ရွိ)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="အေသးစိတ္မွတ္ခ်က္မ်ား..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={depositMutation.isPending}
            >
              {depositMutation.isPending ? "တင္သြင္းေနသည္..." : "ငြေသြင္းေတာင္းဆို"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}