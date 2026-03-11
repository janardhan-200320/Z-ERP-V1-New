import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Building, Calendar, Mail, Phone, Send, RefreshCw, FileText } from "lucide-react";

type ExpiryAlert = {
  id: string;
  contractTitle: string;
  client: string;
  daysRemaining: number;
  priority: "high" | "medium" | "low";
  contactEmail: string;
  contactPhone: string;
  lastContacted?: string;
  contractValue: string;
  projectManager: string;
};

export default function ExpiryAlertsModule() {
  const alerts: ExpiryAlert[] = [
    {
      id: "CNT011",
      contractTitle: "Cloud Infrastructure Management",
      client: "TechStart Solutions",
      daysRemaining: 15,
      priority: "high",
      contactEmail: "contact@techstart.com",
      contactPhone: "+1 234 567 8911",
      lastContacted: "2026-01-10",
      contractValue: "$380,000",
      projectManager: "Sarah Johnson"
    },
    {
      id: "CNT012",
      contractTitle: "Mobile App Development",
      client: "Retail Express Inc",
      daysRemaining: 22,
      priority: "high",
      contactEmail: "info@retailexpress.com",
      contactPhone: "+1 234 567 8912",
      lastContacted: "2026-01-08",
      contractValue: "$215,000",
      projectManager: "Michael Chen"
    },
    {
      id: "CNT013",
      contractTitle: "Data Analytics Platform",
      client: "Finance Hub Ltd",
      daysRemaining: 45,
      priority: "medium",
      contactEmail: "contact@financehub.com",
      contactPhone: "+1 234 567 8913",
      lastContacted: "2026-01-05",
      contractValue: "$490,000",
      projectManager: "David Kim"
    },
    {
      id: "CNT014",
      contractTitle: "Security Audit Services",
      client: "SecureNet Corp",
      daysRemaining: 38,
      priority: "medium",
      contactEmail: "admin@securenet.com",
      contactPhone: "+1 234 567 8914",
      contractValue: "$165,000",
      projectManager: "Emily Watson"
    },
    {
      id: "CNT015",
      contractTitle: "Website Maintenance",
      client: "Marketing Pro Agency",
      daysRemaining: 67,
      priority: "low",
      contactEmail: "hello@marketingpro.com",
      contactPhone: "+1 234 567 8915",
      lastContacted: "2025-12-28",
      contractValue: "$95,000",
      projectManager: "Jessica Martinez"
    },
    {
      id: "CNT016",
      contractTitle: "IT Support Contract",
      client: "Education Systems",
      daysRemaining: 8,
      priority: "high",
      contactEmail: "support@edusystems.com",
      contactPhone: "+1 234 567 8916",
      lastContacted: "2026-01-12",
      contractValue: "$142,000",
      projectManager: "Robert Taylor"
    },
    {
      id: "CNT017",
      contractTitle: "Digital Transformation",
      client: "Manufacturing Plus",
      daysRemaining: 52,
      priority: "medium",
      contactEmail: "contact@mfgplus.com",
      contactPhone: "+1 234 567 8917",
      lastContacted: "2026-01-03",
      contractValue: "$625,000",
      projectManager: "David Kim"
    },
    {
      id: "CNT018",
      contractTitle: "CRM Implementation",
      client: "Sales Dynamics Inc",
      daysRemaining: 73,
      priority: "low",
      contactEmail: "info@salesdynamics.com",
      contactPhone: "+1 234 567 8918",
      contractValue: "$285,000",
      projectManager: "Sarah Johnson"
    }
  ];

  const priorityConfig = {
    high: {
      color: "bg-red-100 text-red-700 border-red-300",
      icon: AlertTriangle,
      label: "High Priority"
    },
    medium: {
      color: "bg-orange-100 text-orange-700 border-orange-300",
      icon: AlertTriangle,
      label: "Medium Priority"
    },
    low: {
      color: "bg-slate-100 text-slate-700 border-slate-300",
      icon: AlertTriangle,
      label: "Low Priority"
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 15) return "text-red-700";
    if (days <= 30) return "text-orange-700";
    return "text-slate-700";
  };

  const getDaysRemainingBg = (days: number) => {
    if (days <= 15) return "bg-red-50 border-red-200";
    if (days <= 30) return "bg-orange-50 border-orange-200";
    return "bg-slate-50 border-slate-200";
  };

  // Group alerts by priority
  const highPriorityAlerts = alerts.filter(a => a.priority === "high");
  const mediumPriorityAlerts = alerts.filter(a => a.priority === "medium");
  const lowPriorityAlerts = alerts.filter(a => a.priority === "low");

  const AlertCard = ({ alert }: { alert: ExpiryAlert }) => {
    const PriorityIcon = priorityConfig[alert.priority].icon;
    
    return (
      <Card className={`border-2 ${priorityConfig[alert.priority].color.includes('red') ? 'border-red-200 bg-red-50' : priorityConfig[alert.priority].color.includes('orange') ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-lg">{alert.contractTitle}</h3>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="h-4 w-4" />
                <span className="font-medium">{alert.client}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {alert.id} • PM: {alert.projectManager}
              </div>
            </div>
            <Badge variant="outline" className={priorityConfig[alert.priority].color}>
              <PriorityIcon className="h-3 w-3 mr-1" />
              {priorityConfig[alert.priority].label}
            </Badge>
          </div>

          {/* Days Remaining - Large Display */}
          <div className={`p-4 rounded-lg border-2 ${getDaysRemainingBg(alert.daysRemaining)}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600 mb-1">Days Remaining</div>
                <div className={`text-3xl font-bold ${getDaysRemainingColor(alert.daysRemaining)}`}>
                  {alert.daysRemaining}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Expires: {new Date(new Date().setDate(new Date().getDate() + alert.daysRemaining)).toLocaleDateString()}
                </div>
              </div>
              <Calendar className={`h-12 w-12 ${getDaysRemainingColor(alert.daysRemaining)} opacity-20`} />
            </div>
          </div>

          {/* Contract Value */}
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <span className="text-sm text-slate-600">Contract Value</span>
            <span className="font-semibold text-green-700">{alert.contractValue}</span>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 p-3 bg-white rounded-lg border">
            <div className="text-xs font-semibold text-slate-700 mb-2">Contact Details</div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${alert.contactEmail}`} className="text-blue-600 hover:underline">
                {alert.contactEmail}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <a href={`tel:${alert.contactPhone}`} className="text-blue-600 hover:underline">
                {alert.contactPhone}
              </a>
            </div>
            {alert.lastContacted && (
              <div className="text-xs text-slate-500 mt-2 pt-2 border-t">
                Last contacted: {new Date(alert.lastContacted).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <Button size="sm" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Initiate Renewal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Days Remaining" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  <SelectItem value="15">15 days or less</SelectItem>
                  <SelectItem value="30">30 days or less</SelectItem>
                  <SelectItem value="60">60 days or less</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* High Priority Alerts */}
      {highPriorityAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-700">High Priority ({highPriorityAlerts.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {highPriorityAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Alerts */}
      {mediumPriorityAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-orange-700">Medium Priority ({mediumPriorityAlerts.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mediumPriorityAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Low Priority Alerts */}
      {lowPriorityAlerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-700">Low Priority ({lowPriorityAlerts.length})</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {lowPriorityAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
