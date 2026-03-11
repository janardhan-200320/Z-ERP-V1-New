import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plus, Edit, Trash2, Search, Star } from "lucide-react";
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

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  active: boolean;
}

export default function Currency() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const currencies: Currency[] = [
    {
      id: "1",
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      exchangeRate: 1.0,
      isDefault: true,
      active: true,
    },
    {
      id: "2",
      code: "EUR",
      name: "Euro",
      symbol: "€",
      exchangeRate: 0.85,
      isDefault: false,
      active: true,
    },
    {
      id: "3",
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      exchangeRate: 0.73,
      isDefault: false,
      active: true,
    },
    {
      id: "4",
      code: "INR",
      name: "Indian Rupee",
      symbol: "₹",
      exchangeRate: 83.12,
      isDefault: false,
      active: true,
    },
    {
      id: "5",
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      exchangeRate: 110.5,
      isDefault: false,
      active: false,
    },
  ];

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Currency Management</h1>
          <p className="text-muted-foreground">Manage currencies and exchange rates</p>
        </div>
        {/* Header Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search currencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Currency
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Currency</DialogTitle>
                    <DialogDescription>Add a currency for multi-currency support</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">
                          Currency Code <span className="text-red-500">*</span>
                        </Label>
                        <Input id="code" placeholder="USD" maxLength={3} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symbol">
                          Symbol <span className="text-red-500">*</span>
                        </Label>
                        <Input id="symbol" placeholder="$" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Currency Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="name" placeholder="US Dollar" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rate">
                        Exchange Rate <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="rate"
                        type="number"
                        placeholder="1.0"
                        step="0.0001"
                      />
                      <p className="text-xs text-muted-foreground">
                        Exchange rate relative to default currency
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="active">Active</Label>
                      <Switch id="active" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="default">Set as Default Currency</Label>
                      <Switch id="default" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Currency Added",
                          description: "New currency has been added successfully",
                        });
                        setDialogOpen(false);
                      }}
                    >
                      Save Currency
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Currencies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currencies
            </CardTitle>
            <CardDescription>All configured currencies for your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium">Code</th>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Symbol</th>
                    <th className="p-3 text-left text-sm font-medium">Exchange Rate</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCurrencies.map((currency) => (
                    <motion.tr
                      key={currency.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{currency.code}</span>
                          {currency.isDefault && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="p-3">{currency.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono">
                          {currency.symbol}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        {currency.exchangeRate.toFixed(4)}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            currency.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {currency.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            disabled={currency.isDefault}
                          >
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
              <CardTitle className="text-sm font-medium">Total Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencies.length}</div>
              <p className="text-xs text-muted-foreground">configured currencies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Currencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencies.filter((c) => c.active).length}
              </div>
              <p className="text-xs text-muted-foreground">currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Default Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currencies.find((c) => c.isDefault)?.code || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">base currency</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
