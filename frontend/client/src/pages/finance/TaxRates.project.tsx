import { useState } from "react";
import { motion } from "framer-motion";
import { Percent, Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  description?: string;
  active: boolean;
  applicableRegion?: string;
}

export default function TaxRates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const taxRates: TaxRate[] = [
    {
      id: "1",
      name: "GST",
      percentage: 18,
      description: "Goods and Services Tax",
      active: true,
      applicableRegion: "India",
    },
    {
      id: "2",
      name: "VAT",
      percentage: 20,
      description: "Value Added Tax",
      active: true,
      applicableRegion: "UK",
    },
    {
      id: "3",
      name: "Sales Tax",
      percentage: 7.5,
      description: "State Sales Tax",
      active: true,
      applicableRegion: "California, USA",
    },
    {
      id: "4",
      name: "Service Tax",
      percentage: 15,
      description: "Service-based tax",
      active: false,
      applicableRegion: "Global",
    },
  ];

  const filteredTaxRates = taxRates.filter((rate) =>
    rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tax Rates</h1>
          <p className="text-muted-foreground">Manage tax rates for invoicing and billing</p>
        </div>
        {/* Header Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tax rates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tax Rate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Tax Rate</DialogTitle>
                    <DialogDescription>Create a new tax rate for billing</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Tax Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="name" placeholder="e.g., GST, VAT" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="percentage">
                        Percentage <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="percentage"
                          type="number"
                          placeholder="18"
                          className="pr-8"
                          step="0.01"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Applicable Region</Label>
                      <Input id="region" placeholder="e.g., India, UK, Global" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Brief description" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="active">Active</Label>
                      <Switch id="active" defaultChecked />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Tax Rate Added",
                          description: "New tax rate has been created successfully",
                        });
                        setDialogOpen(false);
                      }}
                    >
                      Save Tax Rate
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Tax Rates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Tax Rates
            </CardTitle>
            <CardDescription>All configured tax rates for your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Tax Name</th>
                    <th className="p-3 text-left text-sm font-medium">Percentage</th>
                    <th className="p-3 text-left text-sm font-medium">Applicable Region</th>
                    <th className="p-3 text-left text-sm font-medium">Description</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxRates.map((rate) => (
                    <motion.tr
                      key={rate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3 font-medium">{rate.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-semibold">
                          {rate.percentage}%
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{rate.applicableRegion || "-"}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {rate.description || "-"}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            rate.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {rate.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Tax Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taxRates.length}</div>
              <p className="text-xs text-muted-foreground">configured rates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {taxRates.filter((r) => r.active).length}
              </div>
              <p className="text-xs text-muted-foreground">currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  taxRates.reduce((sum, r) => sum + r.percentage, 0) / taxRates.length
                ).toFixed(2)}
                %
              </div>
              <p className="text-xs text-muted-foreground">across all rates</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
