import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, Edit, Trash2, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface PaymentMode {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  isOnline: boolean;
}

export default function PaymentModes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const paymentModes: PaymentMode[] = [
    {
      id: "1",
      name: "Credit Card",
      description: "Visa, Mastercard, Amex",
      active: true,
      isOnline: true,
    },
    {
      id: "2",
      name: "Bank Transfer",
      description: "Direct bank transfer / Wire transfer",
      active: true,
      isOnline: false,
    },
    {
      id: "3",
      name: "Cash",
      description: "Cash payment on delivery or in-person",
      active: true,
      isOnline: false,
    },
    {
      id: "4",
      name: "PayPal",
      description: "PayPal online payment",
      active: true,
      isOnline: true,
    },
    {
      id: "5",
      name: "Check",
      description: "Payment by check",
      active: true,
      isOnline: false,
    },
    {
      id: "6",
      name: "UPI",
      description: "Unified Payments Interface",
      active: true,
      isOnline: true,
    },
  ];

  const filteredModes = paymentModes.filter(
    (mode) =>
      mode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mode.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Modes</h1>
          <p className="text-muted-foreground">Manage available payment methods</p>
        </div>
        {/* Header Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payment modes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Mode
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Payment Mode</DialogTitle>
                    <DialogDescription>
                      Create a new payment method for transactions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Payment Mode Name <span className="text-red-500">*</span>
                      </Label>
                      <Input id="name" placeholder="e.g., Credit Card, PayPal" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of payment method"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="online">Online Payment</Label>
                        <p className="text-xs text-muted-foreground">
                          Is this an online payment method?
                        </p>
                      </div>
                      <Switch id="online" />
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
                          title: "Payment Mode Added",
                          description: "New payment mode has been created successfully",
                        });
                        setDialogOpen(false);
                      }}
                    >
                      Save Payment Mode
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modes Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModes.map((mode) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                    </div>
                    <Badge
                      className={
                        mode.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {mode.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {mode.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {mode.isOnline ? "Online" : "Offline"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Payment Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentModes.length}</div>
              <p className="text-xs text-muted-foreground">configured methods</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Online Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentModes.filter((m) => m.isOnline).length}
              </div>
              <p className="text-xs text-muted-foreground">online methods</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paymentModes.filter((m) => m.active).length}
              </div>
              <p className="text-xs text-muted-foreground">currently active</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
