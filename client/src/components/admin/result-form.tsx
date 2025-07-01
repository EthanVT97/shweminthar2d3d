import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertResultSchema, type InsertResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ResultForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertResult>({
    resolver: zodResolver(insertResultSchema),
    defaultValues: {
      date: new Date(),
      result2d: "",
      result3d: "",
    },
  });

  const createResultMutation = useMutation({
    mutationFn: async (data: InsertResult) => {
      return apiRequest("POST", "/api/admin/results", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Result created and bets processed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/results/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create result",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertResult) => {
    // Validate 2D and 3D formats
    if (data.result2d && (data.result2d.length !== 2 || !/^\d{2}$/.test(data.result2d))) {
      toast({
        title: "Error",
        description: "2D result must be exactly 2 digits (00-99)",
        variant: "destructive",
      });
      return;
    }
    
    if (data.result3d && (data.result3d.length !== 3 || !/^\d{3}$/.test(data.result3d))) {
      toast({
        title: "Error",
        description: "3D result must be exactly 3 digits (000-999)",
        variant: "destructive",
      });
      return;
    }

    createResultMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="result2d"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2D Result</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00-99"
                      maxLength={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="result3d"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3D Result</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000-999"
                      maxLength={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Draw Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createResultMutation.isPending}
            >
              {createResultMutation.isPending
                ? "Processing..."
                : "Update Results & Process Payouts"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
