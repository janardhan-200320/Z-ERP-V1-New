import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Mail, 
  FileSignature, 
  DollarSign, 
  Target,
  ArrowRight,
  Globe,
  Server,
  CreditCard,
  TrendingUp
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsDashboard() {
  const settingsCategories = [
    {
      title: "General Settings",
      description: "Configure company information, localization, and system preferences",
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/dashboard/settings/general",
      features: ["Company Details", "Timezone & Language", "Date/Time Format", "Fiscal Year"]
    },
    {
      title: "Email Settings",
      description: "Configure SMTP server, sender settings, and notification preferences",
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/dashboard/settings/email",
      features: ["SMTP Configuration", "Sender Information", "Email Notifications", "Test Connection"]
    },
    {
      title: "E-Sign Settings",
      description: "Setup electronic signatures and document signing workflows",
      icon: FileSignature,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      path: "/dashboard/settings/esign",
      features: ["Digital Signatures", "Provider Integration", "Signature Appearance", "Document Retention"]
    },
    {
      title: "Finance Settings",
      description: "Manage currency, tax rates, invoicing, and payment gateways",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/dashboard/settings/finance",
      features: ["Currency & Tax", "Invoice Numbering", "Payment Terms", "Gateway Integration"]
    },
    {
      title: "Leads Settings",
      description: "Config  ure lead capture and assignment rules",
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      path: "/dashboard/settings/leads",
      features: ["Lead Capture", "Auto Assignment"]
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure and customize your system preferences</p>
        </div>
        {/* Header Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">System Language</p>
                  <p className="text-lg font-semibold">English</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Status</p>
                  <p className="text-lg font-semibold text-green-600">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Gateway</p>
                  <p className="text-lg font-semibold">Stripe</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>

        {/* Settings Categories */}
        <div className="grid gap-6 md:grid-cols-2">
          {settingsCategories.map((category) => (
            <Card key={category.path} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${category.bgColor}`}>
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {category.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link href={category.path}>
                    <Button variant="outline" className="w-full mt-4">
                      Configure Settings
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
              Configuration Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Start with <strong>General Settings</strong> to configure your company information and timezone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Setup <strong>Email Settings</strong> to enable automated notifications and communications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Configure <strong>Finance Settings</strong> before creating invoices and processing payments</span>
              </li>
              
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
