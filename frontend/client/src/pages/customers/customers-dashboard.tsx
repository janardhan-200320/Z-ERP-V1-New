import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, MessageSquare, UserPlus, UserCheck, UserCircle, MessagesSquare, FolderTree, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import CustomersListModule from "./customers-list";
import CommunicationLogModule from "./communication-log";

export default function CustomersDashboard() {
  const [activeTab, setActiveTab] = useState("customers");

  // KPI Data
  const kpiData = [
    {
      title: "Total Leads",
      value: "342",
      description: "in sales pipeline",
      icon: UserPlus,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Active Customers",
      value: "156",
      description: "current accounts",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pipeline Value",
      value: "$2.4M",
      description: "estimated revenue",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Conversations Logged",
      value: "1,248",
      description: "this month",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>
          </div>
          <p className="text-gray-500">
            Manage leads, customers, and communications
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <Card className="mb-6 border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/customers/groups">
              <Button variant="outline" size="sm" className="border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200">
                <FolderTree className="h-4 w-4 mr-2" />
                Customer Groups
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200">
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="customers" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all duration-200"
          >
            <UserCircle className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger 
            value="communication" 
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all duration-200"
          >
            <MessagesSquare className="h-4 w-4" />
            Communication Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-0">
          <CustomersListModule />
        </TabsContent>

        <TabsContent value="communication" className="mt-0">
          <CommunicationLogModule />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
