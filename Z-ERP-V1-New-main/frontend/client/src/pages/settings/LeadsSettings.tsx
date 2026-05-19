import { useState } from "react";
import { Save, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

export default function LeadsSettings() {
  
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leads Settings</h1>
          <p className="text-muted-foreground">Configure lead capture and assignment rules</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Lead Capture Settings</CardTitle>
            </div>
            <CardDescription>Configure how leads are captured and managed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-source">Default Lead Source</Label>
              <Select defaultValue="website">
                <SelectTrigger id="default-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-status">Default Lead Status</Label>
              <Select defaultValue="new">
                <SelectTrigger id="default-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Auto-Assign Leads</Label>
                <p className="text-sm text-muted-foreground">Automatically assign new leads to team members</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Duplicate Detection</Label>
                <p className="text-sm text-muted-foreground">Check for duplicate leads by email</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Assignment Rules</CardTitle>
            <CardDescription>Configure lead assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-method">Assignment Method</Label>
              <Select defaultValue="round-robin">
                <SelectTrigger id="assignment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                  <SelectItem value="load-balance">Load Balance</SelectItem>
                  <SelectItem value="territory">By Territory</SelectItem>
                  <SelectItem value="skill">By Skill/Expertise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">How to distribute leads among team members</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="reassign-time">Auto-Reassign After (Hours)</Label>
              <Input id="reassign-time" type="number" defaultValue="24" />
              <p className="text-sm text-muted-foreground">Reassign if no contact made within this time</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Notify on Assignment</Label>
                <p className="text-sm text-muted-foreground">Email team member when lead is assigned</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nurture Settings</CardTitle>
            <CardDescription>Configure lead nurturing and follow-ups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up">Default Follow-up Interval (Days)</Label>
              <Select defaultValue="3">
                <SelectTrigger id="follow-up">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label>Enable Drip Campaigns</Label>
                <p className="text-sm text-muted-foreground">Automatically send nurture emails</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => {
              toast({ title: "Settings Saved", description: "Leads settings have been updated successfully." });
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
