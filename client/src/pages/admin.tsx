import Navigation from "@/components/layout/navigation";
import ResultForm from "@/components/admin/result-form";
import TransactionManagement from "@/components/admin/transaction-management";
import BetAnalytics from "@/components/admin/bet-analytics";
import { AlertTriangle } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Admin Dashboard</h3>
              <p className="text-red-600">Administrative functions and controls</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ResultForm />
          <TransactionManagement />
        </div>

        <BetAnalytics />
      </div>
    </div>
  );
}
