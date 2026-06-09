import { Route, Switch } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import SubscriptionDashboard from "./subscription-dashboard";
import SubscriptionList from "./subscription-list";
import SubscriptionForm from "./subscription-form";
import SubscriptionDetails from "./subscription-details";
import ReminderConfig from "./reminder-config";
import Reports from "./reports";
import CancelSubscription from "./cancel-subscription";
import RenewSubscription from "./renew-subscription";

export default function SubscriptionManagement() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/subscriptions" component={SubscriptionDashboard} />
        <Route path="/subscriptions/list" component={SubscriptionList} />
        <Route path="/subscriptions/new" component={SubscriptionForm} />
        <Route path="/subscriptions/:id/edit" component={SubscriptionForm} />
        <Route path="/subscriptions/:id/renew" component={RenewSubscription} />
        <Route path="/subscriptions/:id/cancel" component={CancelSubscription} />
        <Route path="/subscriptions/reports" component={Reports} />
        <Route path="/subscriptions/reminders" component={ReminderConfig} />
        <Route path="/subscriptions/:id" component={SubscriptionDetails} />
      </Switch>
    </DashboardLayout>
  );
}
