import ErrorBoundary from "@/components/ErrorBoundary";
import TopProgressBar from "@/components/TopProgressBar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import DashboardOverview from "@/pages/dashboard-overview";
import NotFound from "@/pages/not-found";

// Projects Module Pages
import ProjectsList from "@/pages/projects/projects-list";
import ProjectDetail from "@/pages/projects/project-detail";

// HRM Module Pages
import HRMDashboard from "@/pages/hrm/hrm-dashboard";
import HRMEmployees from "@/pages/hrm/hrm-employees";
import HRMAttendance from "@/pages/hrm/hrm-attendance";
import HRMPayroll from "@/pages/hrm/hrm-payroll";
import HRMInsurance from "@/pages/hrm/hrm-insurance";
import HRMAssets from "@/pages/hrm/hrm-assets";
import HRMPerformance from "@/pages/hrm/hrm-performance";
import HRMLetters from "@/pages/hrm/hrm-letters";
import HRMTravelExpense from "@/pages/hrm/hrm-travel-expense";
import HRMAutomation from "@/pages/hrm/hrm-automation";
import HRMWorkflows from "@/pages/hrm/hrm-workflows";

// Sales Module Pages
import SalesDashboard from "@/pages/sales/sales-dashboard";

// Accounts Module Pages
import AccountsModule from "@/pages/accounts/index";

// Recruitment Module Pages
import RecruitmentDashboard from "@/pages/recruitment/recruitment-dashboard";

// Customers Module Pages
import CustomersDashboard from "@/pages/customers/customers-dashboard";

// Contracts Module Pages
import ContractsDashboard from "@/pages/contracts/contracts-dashboard";

// Vendors Module Pages
import VendorsLanding from "@/pages/vendors/VendorsLanding";

// Profile Module Pages
import EmployeeProfile from "@/pages/profile/EmployeeProfile";

// New Enterprise Components
import AttendanceDashboard from "@/pages/attendance/AttendanceDashboard";
import OrganizationsManagement from "@/pages/organizations/OrganizationsManagement";

// New Z-ERP Modules
import SubscriptionManagement from "@/pages/subscriptions/SubscriptionManagement";
import LeadsWorkflow from "@/pages/leads/index";
import AdminSetup from "@/pages/admin/AdminSetup";

// Contacts Module
// ContactsList removed

// Setup Module
import StaffSetup from "@/pages/setup/StaffSetup";
import GroupsPage from "@/pages/setup/groups";
import PermissionsPage from "@/pages/setup/permissions";
import RolesPage from "@/pages/setup/roles";

// Customer Groups
import CustomerGroups from "@/pages/customers/customer-groups";

// Lead Management Pages
import LeadStatus from "@/pages/leads/lead-status";
import LeadNotes from "@/pages/leads/notes";
import LeadCommunication from "@/pages/leads/communication";
import LeadAssign from "@/pages/leads/assign";
import LeadCallStatus from "@/pages/leads/call-status";
import LeadProposals from "@/pages/leads/proposals";

// Contract Types
import ContractTypes from "@/pages/contracts/contract-types";

// Team Space Module
import TeamSpaceDashboard from "@/pages/team-space/team-space-dashboard";

// Settings Module
import SettingsDashboard from "@/pages/settings/SettingsDashboard";
import GeneralSettings from "@/pages/settings/GeneralSettings";
import ESignSettings from "@/pages/settings/ESignSettings";
import FinanceSettings from "@/pages/settings/FinanceSettings";
import LeadsSettings from "@/pages/settings/LeadsSettings";

// Auth Pages
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import CallsModule from "./pages/team-space/calls";

// No authentication required - all routes are accessible

function AppRouter() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      {/* Roots and Modules */}
      <Route path="/" component={DashboardOverview} />
      
      {/* Accounts Module Routes - Delegate all /accounts paths */}
      <Route path="/accounts/*" component={AccountsModule} />
      <Route path="/accounts" component={AccountsModule} />

      {/* Main Module Routes */}
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/projects" component={ProjectsList} />
      
      {/* HRM Module Routes */}
      <Route path="/hrm/employees" component={HRMEmployees} />
      <Route path="/hrm/attendance" component={HRMAttendance} />
      <Route path="/hrm/payroll" component={HRMPayroll} />
      <Route path="/hrm/insurance" component={HRMInsurance} />
      <Route path="/hrm/assets" component={HRMAssets} />
      <Route path="/hrm/performance" component={HRMPerformance} />
      <Route path="/hrm/letters" component={HRMLetters} />
      <Route path="/hrm/travel-expense" component={HRMTravelExpense} />
      <Route path="/hrm/automation" component={HRMAutomation} />
      <Route path="/hrm/workflows" component={HRMWorkflows} />
      <Route path="/hrm/*" component={HRMDashboard} />
      <Route path="/hrm" component={HRMDashboard} />
      
      <Route path="/sales/*" component={SalesDashboard} />
      <Route path="/sales" component={SalesDashboard} />
      
      <Route path="/recruitment/*" component={RecruitmentDashboard} />
      <Route path="/recruitment" component={RecruitmentDashboard} />
      
      <Route path="/customers/groups" component={CustomerGroups} />
      <Route path="/customers/*" component={CustomersDashboard} />
      <Route path="/customers" component={CustomersDashboard} />
      
      <Route path="/contracts/*" component={ContractsDashboard} />
      <Route path="/contracts" component={ContractsDashboard} />
      
      <Route path="/vendors/*" component={VendorsLanding} />
      <Route path="/vendors" component={VendorsLanding} />
      <Route path="/profile/*" component={EmployeeProfile} />
      <Route path="/profile" component={EmployeeProfile} />
      
      {/* Attendance Module */}
      <Route path="/attendance/*" component={AttendanceDashboard} />
      <Route path="/attendance" component={AttendanceDashboard} />
      
      {/* Organizations Module */}
      <Route path="/organizations/*" component={OrganizationsManagement} />
      <Route path="/organizations" component={OrganizationsManagement} />
      
      {/* Setup Module */}
      <Route path="/dashboard/setup/groups" component={GroupsPage} />
      <Route path="/dashboard/setup/roles" component={RolesPage} />
      <Route path="/dashboard/setup/permissions" component={PermissionsPage} />
      <Route path="/dashboard/setup/*" component={StaffSetup} />
      <Route path="/dashboard/setup" component={StaffSetup} />
      
      {/* Subscription Management Module */}
      <Route path="/subscriptions/*" component={SubscriptionManagement} />
      <Route path="/subscriptions" component={SubscriptionManagement} />
      
      {/* Leads & Workflow Module */}
      <Route path="/leads/notes" component={LeadNotes} />
      <Route path="/leads/communication" component={LeadCommunication} />
      <Route path="/leads/lead-status" component={LeadStatus} />
      <Route path="/leads/assign" component={LeadAssign} />
      <Route path="/leads/call-status" component={LeadCallStatus} />
      <Route path="/leads/proposals" component={LeadProposals} />
      <Route path="/leads/*" component={LeadsWorkflow} />
      <Route path="/leads" component={LeadsWorkflow} />
      
      {/* Team Space Module */}
      <Route path="/team-space/*" component={TeamSpaceDashboard} />
      <Route path="/team-space" component={TeamSpaceDashboard} />
      

      {/* Admin Setup Module */}
      <Route path="/admin/*" component={AdminSetup} />
      <Route path="/admin" component={AdminSetup} />
      
      {/* Settings Module */}
      <Route path="/dashboard/settings/*" component={SettingsDashboard} />
      <Route path="/dashboard/settings" component={SettingsDashboard} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Global error handler to catch unhandled promise rejections
    const handleError = (event: ErrorEvent) => {
      console.error('❌ GLOBAL ERROR CAUGHT:');
      console.error('Message:', event.message);
      console.error('Error:', event.error);
      console.error('Filename:', event.filename);
      console.error('Line:', event.lineno, 'Column:', event.colno);
      console.error('Stack:', event.error?.stack);
      event.preventDefault(); // Prevent default browser error handling
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ UNHANDLED PROMISE REJECTION:');
      console.error('Reason:', event.reason);
      console.error('Promise:', event.promise);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WorkspaceProvider>
          <NotificationProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <Toaster />
                <AppRouter />
              </ErrorBoundary>
            </TooltipProvider>
          </NotificationProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
