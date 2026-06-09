import { useState } from "react";
import { motion } from "framer-motion";
import { FileSignature, Plus, Edit, Trash2 } from "lucide-react";
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
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface ContractType {
  id: string;
  name: string;
  description?: string;
  contractCount: number;
  color: string;
}

export default function ContractTypes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const types: ContractType[] = [
    {
      id: "1",
      name: "Service Agreement",
      description: "Standard service contracts",
      contractCount: 45,
      color: "bg-blue-500",
    },
    {
      id: "2",
      name: "NDA",
      description: "Non-disclosure agreements",
      contractCount: 78,
      color: "bg-purple-500",
    },
    {
      id: "3",
      name: "SaaS License",
      description: "Software as a Service licensing",
      contractCount: 23,
      color: "bg-green-500",
    },
    {
      id: "4",
      name: "Consulting",
      description: "Consulting service contracts",
      contractCount: 32,
      color: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contract Types</h1>
          <p className="text-muted-foreground">Manage different types of contracts</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contract Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Contract Type</DialogTitle>
                  <DialogDescription>Create a new contract type category</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Type Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" placeholder="Service Agreement, NDA, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this contract type..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      toast({ title: "Contract Type Added" });
                      setDialogOpen(false);
                    }}
                  >
                    Add Type
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <motion.div key={type.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </div>
                    <FileSignature className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs mt-2">
                    {type.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Contracts</span>
                      <Badge variant="outline" className="font-semibold">
                        {type.contractCount}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-1">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 flex-1">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Types</p>
                <p className="text-3xl font-bold">{types.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Contracts</p>
                <p className="text-3xl font-bold">
                  {types.reduce((sum, t) => sum + t.contractCount, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Most Used</p>
                <p className="text-xl font-bold">
                  {types.reduce((max, t) => (t.contractCount > max.contractCount ? t : max)).name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
