import { useState } from "react";
import { Save, DollarSign, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

export default function FinanceSettings() {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Settings</h1>
          <p className="text-muted-foreground">Configure financial settings, currency, and payment options</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Currency & Tax Settings</CardTitle>
            </div>
            <CardDescription>Set default currency and tax configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="default-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency-format">Currency Display Format</Label>
                <Select defaultValue="symbol">
                  <SelectTrigger id="currency-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="symbol">$1,234.56</SelectItem>
                    <SelectItem value="code">USD 1,234.56</SelectItem>
                    <SelectItem value="name">1,234.56 Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-tax">Default Tax Rate</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="default-tax">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (10%)</SelectItem>
                    <SelectItem value="reduced">Reduced (5%)</SelectItem>
                    <SelectItem value="exempt">Tax Exempt (0%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-number">Tax ID / VAT Number</Label>
                <Input id="tax-number" placeholder="Enter Tax ID" defaultValue="US123456789" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Include Tax in Prices</Label>
                <p className="text-sm text-muted-foreground">Show prices with tax included</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>Configure invoice numbering and defaults</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
                <Input id="invoice-prefix" placeholder="INV-" defaultValue="INV-" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-start">Starting Invoice Number</Label>
                <Input id="invoice-start" type="number" placeholder="1000" defaultValue="1000" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms (Days)</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="payment-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Net 7</SelectItem>
                    <SelectItem value="15">Net 15</SelectItem>
                    <SelectItem value="30">Net 30</SelectItem>
                    <SelectItem value="60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="late-fee">Late Payment Fee (%)</Label>
                <Input id="late-fee" type="number" placeholder="5" defaultValue="5" />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Auto-Generate Invoice Numbers</Label>
                <p className="text-sm text-muted-foreground">Automatically increment invoice numbers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Send Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">Email reminders for overdue invoices</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Payment Gateway Settings</CardTitle>
            </div>
            <CardDescription>Configure online payment integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-gateway">Primary Payment Gateway</Label>
              <Select defaultValue="stripe">
                <SelectTrigger id="payment-gateway">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="authorize">Authorize.Net</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gateway-key">API Key</Label>
                <Input id="gateway-key" type="password" placeholder="Enter API Key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gateway-secret">Secret Key</Label>
                <Input id="gateway-secret" type="password" placeholder="Enter Secret Key" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Enable Online Payments</Label>
                <p className="text-sm text-muted-foreground">Allow customers to pay invoices online</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              toast({ title: "Settings Saved", description: "Finance settings have been updated successfully." });
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
