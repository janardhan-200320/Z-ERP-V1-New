import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, UserCheck, UserCircle, MessagesSquare, FolderTree, TrendingUp, UserMinus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import CustomersListModule from "./customers-list";
import CommunicationLogModule from "./communication-log";
import ProjectClientPortalTab from "@/pages/projects/tabs/project-client-portal-tab";
import { fetchCustomerCommunications, fetchCustomers, type CustomerCommunicationRecord, type CustomerRecord } from "@/lib/supabase-data";

export default function CustomersDashboard() {
  const [activeTab, setActiveTab] = useState("customers");
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [communications, setCommunications] = useState<CustomerCommunicationRecord[]>([]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchCustomers(), fetchCustomerCommunications()])
      .then(([customerRows, communicationRows]) => {
        if (!active) return;
        setCustomers(customerRows);
        setCommunications(communicationRows);
      })
      .catch(() => {
        if (!active) return;
        setCustomers([]);
        setCommunications([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const kpiData = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.active).length;
    const inactiveCustomers = totalCustomers - activeCustomers;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customers.filter((customer) => {
      const createdAt = customer.date_created ? new Date(customer.date_created) : null;
      return createdAt ? createdAt >= startOfMonth : false;
    }).length;

    const communicationsThisMonth = communications.filter((comm) => {
      const date = comm.date ? new Date(comm.date) : null;
      return date ? date >= startOfMonth : false;
    }).length;

    return [
      {
        title: "Total Customers",
        value: String(totalCustomers),
        description: "all accounts",
        icon: Users,
        color: "text-teal-600",
        bgColor: "bg-teal-50"
      },
      {
        title: "Active Customers",
        value: String(activeCustomers),
        description: "currently active",
        icon: UserCheck,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        title: "Inactive Customers",
        value: String(inactiveCustomers),
        description: "inactive accounts",
        icon: UserMinus,
        color: "text-green-600",
        bgColor: "bg-green-50"
      },
      {
        title: "Communications Logged",
        value: String(communicationsThisMonth),
        description: "this month",
        icon: MessageSquare,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      }
    ];
  }, [customers, communications]);

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
          <TabsTrigger
            value="client-portal"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-4 py-2 transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4" />
            Client Portal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-0">
          <CustomersListModule />
        </TabsContent>

        <TabsContent value="communication" className="mt-0">
          <CommunicationLogModule />
        </TabsContent>

        <TabsContent value="client-portal" className="mt-0">
          <ProjectClientPortalTab projectId={undefined} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
