import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Globe, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';

export default function MultiCurrencyModule() {
  const currencyAccounts = [
    { currency: 'USD', code: 'US Dollar', balance: '$2,458,000', rate: '1.00', gain: '+$0', color: 'text-blue-700' },
    { currency: 'EUR', code: 'Euro', balance: '€850,000', rate: '0.92', gain: '+$15,420', color: 'text-green-700' },
    { currency: 'GBP', code: 'British Pound', balance: '£450,000', rate: '0.79', gain: '-$8,200', color: 'text-red-700' },
    { currency: 'JPY', code: 'Japanese Yen', balance: '¥125,000,000', rate: '149.50', gain: '+$2,800', color: 'text-green-700' }
  ];

  const transactions = [
    { id: '1', date: '2026-01-15', type: 'Receipt', fromCurrency: 'EUR', toCurrency: 'USD', amount: '€10,000', converted: '$10,870', rate: '1.087' },
    { id: '2', date: '2026-01-14', type: 'Payment', fromCurrency: 'USD', toCurrency: 'GBP', amount: '$25,000', converted: '£19,750', rate: '0.79' },
    { id: '3', date: '2026-01-13', type: 'Transfer', fromCurrency: 'USD', toCurrency: 'JPY', amount: '$50,000', converted: '¥7,475,000', rate: '149.50' }
  ];

  return (
    <Tabs defaultValue="accounts" className="space-y-6">
      <TabsList>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
        <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
        <TabsTrigger value="converter">Currency Converter</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>

      <TabsContent value="accounts" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Multi-Currency Accounts</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Currency
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currencyAccounts.map((account, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{account.currency}</CardTitle>
                      <p className="text-xs text-slate-600">{account.code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                    Rate: {account.rate}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600">Balance</p>
                  <p className={`text-2xl font-bold ${account.color}`}>{account.balance}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-slate-600">Unrealized Gain/Loss</span>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${account.gain.startsWith('+') ? 'text-green-700' : 'text-red-700'}`}>
                    {account.gain.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {account.gain}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="converter" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>From Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Enter amount" defaultValue="1000" className="text-lg" />
              </div>

              <div className="space-y-2">
                <Label>To Currency</Label>
                <Select defaultValue="eur">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                    <SelectItem value="eur">EUR - Euro</SelectItem>
                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                    <SelectItem value="jpy">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <p className="text-xs text-slate-600">Converted Amount</p>
                  <p className="text-2xl font-bold text-green-700">€920.00</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button variant="outline" size="sm">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Swap Currencies
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Exchange Rate:</span> 1 USD = 0.92 EUR
              </p>
              <p className="text-xs text-blue-700 mt-1">Last updated: January 15, 2026 10:30 AM</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Currency Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm">{txn.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{txn.fromCurrency}</TableCell>
                    <TableCell className="font-mono text-sm">{txn.toCurrency}</TableCell>
                    <TableCell className="font-semibold">{txn.amount}</TableCell>
                    <TableCell className="font-semibold text-green-700">{txn.converted}</TableCell>
                    <TableCell className="text-sm">{txn.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rates">
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Exchange rate configuration view coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
