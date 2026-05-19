import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, XCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const cancellationReasons = [
  'Too expensive',
  'Not using the service',
  'Switching to competitor',
  'Service quality issues',
  'Business closed',
  'Budget constraints',
  'Feature limitations',
  'Poor customer support',
  'Other',
];

export default function CancelSubscription() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [reason, setReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sendSurvey, setSendSurvey] = useState(true);
  const [offerDiscount, setOfferDiscount] = useState(false);

  const handleCancel = () => {
    const cancellationData = {
      subscriptionId: params.id,
      reason,
      additionalNotes,
      sendSurvey,
      offerDiscount,
      cancelledAt: new Date().toISOString(),
    };

    console.log('Cancelling subscription:', cancellationData);
    // TODO: Add API call to cancel subscription
    
    // Send notification to client
    if (sendSurvey) {
      console.log('Sending cancellation survey to client');
    }

    setConfirmDialogOpen(false);
    setLocation(`/subscriptions/${params.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      alert('Please select a reason for cancellation');
      return;
    }
    setConfirmDialogOpen(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation(`/subscriptions/${params.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscription
        </Button>
      </div>

      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Cancel Subscription</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This action will mark the subscription as cancelled
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Important Notice</p>
                <p className="text-destructive/90 mt-1">
                  Cancelling this subscription will:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-destructive/80">
                  <li>Stop all automated renewal reminders</li>
                  <li>Mark the subscription status as "Cancelled"</li>
                  <li>Send cancellation notification to the client</li>
                  <li>Update reporting and analytics</li>
                </ul>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Cancellation *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information about the cancellation..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Options */}
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <p className="font-medium text-sm">Cancellation Options</p>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="sendSurvey"
                  checked={sendSurvey}
                  onCheckedChange={(checked) => setSendSurvey(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="sendSurvey"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send feedback survey to client
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get valuable feedback about why they're leaving
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="offerDiscount"
                  checked={offerDiscount}
                  onCheckedChange={(checked) => setOfferDiscount(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="offerDiscount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Offer retention discount
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Attempt to retain the customer with a special offer
                  </p>
                </div>
              </div>
            </div>

            {/* Retention Offer */}
            {offerDiscount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-2">Retention Strategy</p>
                <p className="text-sm text-blue-800">
                  Our system will automatically send a special retention offer to the client with:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-blue-700">
                  <li>20% discount on next renewal</li>
                  <li>Extended support period</li>
                  <li>Priority customer service</li>
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(`/subscriptions/${params.id}`)}
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button type="submit" variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Proceed with Cancellation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this subscription? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Change the status to "Cancelled"</li>
                <li>Stop all renewal reminders</li>
                <li>Notify the client about the cancellation</li>
                {sendSurvey && <li>Send a feedback survey to the client</li>}
                {offerDiscount && <li>Send a retention offer to the client</li>}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
