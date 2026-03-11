import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Calendar, DollarSign, TrendingUp, RefreshCw, CheckCircle, Send, Paperclip } from "lucide-react";

type RenewalContract = {
  id: string;
  client: string;
  currentEndDate: string;
  proposedValue: string;
  renewalProbability: number;
  status: "pending" | "approved" | "follow-up" | "declined";
  currentValue?: string;
  projectManager?: string;
};

export default function ContractRenewalsModule() {
  const renewals: RenewalContract[] = [
    {
      id: "CNT003",
      client: "Healthcare Systems Inc",
      currentEndDate: "2027-02-28",
      proposedValue: "$720,000",
      renewalProbability: 92,
      status: "pending",
      currentValue: "$680,000",
      projectManager: "David Kim"
    },
    {
      id: "CNT001",
      client: "Tech Innovations Ltd",
      currentEndDate: "2026-05-31",
      proposedValue: "$475,000",
      renewalProbability: 85,
      status: "follow-up",
      currentValue: "$450,000",
      projectManager: "Sarah Johnson"
    },
    {
      id: "CNT002",
      client: "Global Retail Corp",
      currentEndDate: "2026-09-14",
      proposedValue: "$340,000",
      renewalProbability: 78,
      status: "pending",
      currentValue: "$320,000",
      projectManager: "Michael Chen"
    },
    {
      id: "CNT004",
      client: "Financial Services Group",
      currentEndDate: "2026-10-31",
      proposedValue: "$550,000",
      renewalProbability: 88,
      status: "approved",
      currentValue: "$520,000",
      projectManager: "Emily Watson"
    },
    {
      id: "CNT007",
      client: "Logistics Partners Inc",
      currentEndDate: "2026-03-15",
      proposedValue: "$285,000",
      renewalProbability: 65,
      status: "follow-up",
      currentValue: "$270,000",
      projectManager: "Robert Taylor"
    },
    {
      id: "CNT008",
      client: "Media Solutions Corp",
      currentEndDate: "2026-07-20",
      proposedValue: "$195,000",
      renewalProbability: 42,
      status: "declined",
      currentValue: "$180,000",
      projectManager: "Jessica Martinez"
    },
    {
      id: "CNT009",
      client: "Automotive Group Ltd",
      currentEndDate: "2026-08-10",
      proposedValue: "$625,000",
      renewalProbability: 95,
      status: "pending",
      currentValue: "$600,000",
      projectManager: "David Kim"
    },
    {
      id: "CNT010",
      client: "Energy Systems Inc",
      currentEndDate: "2026-11-30",
      proposedValue: "$410,000",
      renewalProbability: 72,
      status: "follow-up",
      currentValue: "$390,000",
      projectManager: "Sarah Johnson"
    }
  ];

  const getScoreColor = (probability: number) => {
    if (probability >= 80) return "text-green-700";
    if (probability >= 50) return "text-orange-700";
    return "text-red-700";
  };

  const getScoreBgColor = (probability: number) => {
    if (probability >= 80) return "bg-green-100 border-green-200";
    if (probability >= 50) return "bg-orange-100 border-orange-200";
    return "bg-red-100 border-red-200";
  };

  const getProgressColor = (probability: number) => {
    if (probability >= 80) return "bg-green-600";
    if (probability >= 50) return "bg-orange-600";
    return "bg-red-600";
  };

  const statusConfig = {
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    "follow-up": "bg-orange-100 text-orange-700 border-orange-200",
    declined: "bg-red-100 text-red-700 border-red-200"
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">High Probability (80%+)</p>
                <p className="text-2xl font-bold text-green-700">4</p>
                <p className="text-xs text-slate-600 mt-1">contracts</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Medium Probability (50-79%)</p>
                <p className="text-2xl font-bold text-orange-700">3</p>
                <p className="text-xs text-slate-600 mt-1">contracts</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 mb-1">Low Probability (&lt;50%)</p>
                <p className="text-2xl font-bold text-red-700">1</p>
                <p className="text-xs text-slate-600 mt-1">contract</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Renewal Pipeline Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Renewals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Current End Date</TableHead>
                <TableHead>Proposed Value</TableHead>
                <TableHead>Renewal Probability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((renewal) => (
                <TableRow key={renewal.id} className="hover:bg-slate-50">
                  <TableCell>
                    <span className="font-medium">{renewal.id}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-indigo-600" />
                      <div>
                        <div className="font-medium">{renewal.client}</div>
                        {renewal.projectManager && (
                          <div className="text-xs text-slate-500">PM: {renewal.projectManager}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(renewal.currentEndDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium text-green-700">
                      <DollarSign className="h-4 w-4" />
                      {renewal.proposedValue}
                    </div>
                    {renewal.currentValue && (
                      <div className="text-xs text-slate-500">Current: {renewal.currentValue}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getScoreBgColor(renewal.renewalProbability)}>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {renewal.renewalProbability}%
                        </Badge>
                        <span className={`text-xs font-medium ${getScoreColor(renewal.renewalProbability)}`}>
                          {renewal.renewalProbability >= 80 ? "High" : renewal.renewalProbability >= 50 ? "Medium" : "Low"}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={renewal.renewalProbability} className="h-2" />
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(renewal.renewalProbability)}`}
                          style={{ width: `${renewal.renewalProbability}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[renewal.status]}>
                      {renewal.status === "follow-up" ? "Follow-up" : renewal.status.charAt(0).toUpperCase() + renewal.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Initiate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Initiate Renewal</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="newStartDate">New Start Date *</Label>
                                <Input id="newStartDate" type="date" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newEndDate">New End Date *</Label>
                                <Input id="newEndDate" type="date" />
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label htmlFor="proposedValue">Proposed Value *</Label>
                                <Input id="proposedValue" defaultValue={renewal.proposedValue} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="renewalNotes">Notes</Label>
                              <Textarea id="renewalNotes" placeholder="Add renewal notes..." rows={3} />
                            </div>
                            <div className="space-y-2">
                              <Label>Attachments</Label>
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                                <Paperclip className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                                <p className="text-xs text-slate-600">Attach renewal documents</p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Renewal</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {renewal.status === "pending" && (
                        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      {renewal.status === "follow-up" && (
                        <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Send className="h-4 w-4 mr-2" />
                          Follow-up
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
