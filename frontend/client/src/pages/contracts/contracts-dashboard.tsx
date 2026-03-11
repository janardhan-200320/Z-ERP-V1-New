import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw, DollarSign, AlertTriangle, FilePlus, FileCheck, Calendar, Bell, FileSignature } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ActiveContractsModule from "./active-contracts";
import ContractRenewalsModule from "./contract-renewals";
import ExpiryAlertsModule from "./expiry-alerts";

export default function ContractsDashboard() {
  const [activeTab, setActiveTab] = useState("active");

  // KPI Data
  const kpiData = [
    {
      title: "Active Contracts",
      value: "68",
      description: "currently in force",
      icon: FileCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Contracts Up for Renewal",
      value: "12",
      description: "within 90 days",
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Contract Value",
      value: "$8.5M",
      description: "active portfolio",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Expiry Alerts",
      value: "8",
      description: "require attention",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-bold">Contracts</h1>
          </div>
          <p className="text-slate-600">
            Manage contracts, renewals, and expiry alerts
          </p>
        </div>
        <Button size="sm">
          <FilePlus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-slate-600">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href="/contracts/types">
              <Button variant="outline" size="sm">
                <FileSignature className="h-4 w-4 mr-2" />
                Contract Types
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Active Contracts
          </TabsTrigger>
          <TabsTrigger value="renewals" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Renewals
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Expiry Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveContractsModule />
        </TabsContent>

        <TabsContent value="renewals">
          <ContractRenewalsModule />
        </TabsContent>

        <TabsContent value="alerts">
          <ExpiryAlertsModule />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
