import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Users,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type SettingsModuleCard = {
  title: string;
  description: string;
  path?: string;
  icon: any;
  iconStyle: string;
  isComingSoon?: boolean;
};

export default function SettingsDashboard() {
  const modules: SettingsModuleCard[] = [
    {
      title: "General",
      description: "Workspace name, timezone, language and basic preferences.",
      path: "/dashboard/settings/general",
      icon: Settings,
      iconStyle: "bg-slate-100 text-slate-600",
    },
    {
      title: "Appearance",
      description: "Theme, accent color, font size and layout density.",
      path: "/dashboard/settings/general",
      icon: Palette,
      iconStyle: "bg-violet-100 text-violet-600",
    },
    {
      title: "Notifications",
      description: "Email, in-app and push notification preferences.",
      path: "/dashboard/settings/leads",
      icon: Bell,
      iconStyle: "bg-amber-100 text-amber-600",
    },
    {
      title: "Security",
      description: "Password policy, two-factor auth and session management.",
      path: "/dashboard/settings/esign",
      icon: Shield,
      iconStyle: "bg-rose-100 text-rose-600",
    },
    {
      title: "Team & Permissions",
      description: "Manage roles, access levels and team member permissions.",
      path: "/admin/permissions",
      icon: Users,
      iconStyle: "bg-blue-100 text-blue-600",
    },
    {
      title: "Billing & Plans",
      description: "Subscription plan, invoices and payment methods.",
      icon: CreditCard,
      iconStyle: "bg-emerald-100 text-emerald-600",
      isComingSoon: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Settings</h1>
          <p className="text-lg text-slate-500 mt-2">
            Manage your workspace configuration, preferences and customization options.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const CardBody = (
              <Card
                className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ${
                  module.isComingSoon ? "opacity-70" : "hover:shadow-md hover:border-slate-300"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${module.iconStyle}`}>
                      <module.icon className="h-5 w-5" />
                    </div>
                    {module.isComingSoon && (
                      <Badge variant="outline" className="rounded-full text-xs font-bold text-slate-500 border-slate-200">
                        Soon
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                      {module.title}
                    </h2>
                    <p className="mt-3 text-lg text-slate-500 leading-snug">{module.description}</p>
                  </div>

                  {!module.isComingSoon && (
                    <div className="mt-5 inline-flex items-center gap-1 text-base font-semibold text-indigo-600">
                      Configure
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            if (module.isComingSoon || !module.path) {
              return <div key={module.title}>{CardBody}</div>;
            }

            return (
              <Link key={module.title} href={module.path}>
                {CardBody}
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
