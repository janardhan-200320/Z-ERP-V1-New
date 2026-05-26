import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import BankAccounts from "./bank-accounts";
import BankReconciliation from "./reconciliation";
import ChequeManagement from "./cheques";
import CashBankEntries from "./cash-bank";

export default function Banking({ includeLayout = true }: any) {
  const [location] = useLocation();

  const renderSubModule = () => {
    const loc = location.toLowerCase();
    if (loc.includes("/accounts/banking/accounts")) {
      return <BankAccounts />;
    }
    if (loc.includes("/accounts/banking/reconciliation")) {
      return <BankReconciliation />;
    }
    if (loc.includes("/accounts/banking/cheques")) {
      return <ChequeManagement />;
    }
    if (loc.includes("/accounts/banking/cash-bank")) {
      return <CashBankEntries />;
    }
    return <BankAccounts />;
  };

  const content = (
    <div className="space-y-4">
      {renderSubModule()}
    </div>
  );

  if (!includeLayout) {
    return content;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {content}
      </div>
    </DashboardLayout>
  );
}
