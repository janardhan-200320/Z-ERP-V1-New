import { useState } from "react";
import { Save, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { getFinanceSettings, saveFinanceSettings } from "@/lib/finance-settings";

export default function FinanceSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => getFinanceSettings());

  const handleSave = () => {
    const saved = saveFinanceSettings(settings);
    setSettings(saved);
    toast({ title: "Settings Saved", description: "Finance settings have been updated successfully." });
  };

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
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, defaultCurrency: value }))}
                >
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
                <Select
                  value={settings.currencyFormat}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, currencyFormat: value }))}
                >
                  <SelectTrigger id="currency-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="symbol">₹1,234.56</SelectItem>
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
                <div className="flex gap-2">
                  <Input
                    id="default-tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.defaultTaxRate}
                    onChange={(e) => setSettings((prev) => ({ ...prev, defaultTaxRate: Number(e.target.value) || 0 }))}
                  />
                  <div className="h-10 min-w-10 rounded-md border bg-muted px-3 text-sm flex items-center justify-center">%</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-number">Tax ID / VAT Number</Label>
                <Input
                  id="tax-number"
                  placeholder="Enter Tax ID"
                  value={settings.taxNumber}
                  onChange={(e) => setSettings((prev) => ({ ...prev, taxNumber: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Include Tax in Prices</Label>
                <p className="text-sm text-muted-foreground">Show prices with tax included</p>
              </div>
              <Switch
                checked={settings.includeTaxInPrices}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, includeTaxInPrices: checked }))}
              />
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
                <Input
                  id="invoice-prefix"
                  placeholder="INV-"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings((prev) => ({ ...prev, invoicePrefix: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-start">Starting Invoice Number</Label>
                <Input
                  id="invoice-start"
                  type="number"
                  placeholder="1000"
                  value={settings.invoiceStartNumber}
                  onChange={(e) => setSettings((prev) => ({ ...prev, invoiceStartNumber: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms (Days)</Label>
                <Select
                  value={String(settings.paymentTermsDays)}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, paymentTermsDays: Number(value) || 0 }))}
                >
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
                <Input
                  id="late-fee"
                  type="number"
                  placeholder="5"
                  value={settings.lateFeePercent}
                  onChange={(e) => setSettings((prev) => ({ ...prev, lateFeePercent: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Auto-Generate Invoice Numbers</Label>
                <p className="text-sm text-muted-foreground">Automatically increment invoice numbers</p>
              </div>
              <Switch
                checked={settings.autoGenerateInvoiceNumbers}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoGenerateInvoiceNumbers: checked }))}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Send Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">Email reminders for overdue invoices</p>
              </div>
              <Switch
                checked={settings.sendPaymentReminders}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, sendPaymentReminders: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
