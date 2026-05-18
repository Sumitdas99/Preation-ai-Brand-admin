import { CreditCard, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const usageMetrics = [
  {
    name: "Image Scans",
    used: 8500,
    limit: 10000,
    unit: "scans",
    percentage: 85,
  },
  {
    name: "Video Processing",
    used: 420,
    limit: 500,
    unit: "minutes",
    percentage: 84,
  },
  {
    name: "Text Analysis",
    used: 1800,
    limit: 2000,
    unit: "analyses",
    percentage: 90,
  },
  {
    name: "Evidence Packs",
    used: 245,
    limit: 1000,
    unit: "packs",
    percentage: 24,
  },
];

const billingHistory = [
  {
    id: "inv_001",
    date: "2024-10-01",
    amount: "$2,000.00",
    status: "paid",
    plan: "Business",
  },
  {
    id: "inv_002",
    date: "2024-09-01",
    amount: "$2,000.00",
    status: "paid",
    plan: "Business",
  },
  {
    id: "inv_003",
    date: "2024-08-01",
    amount: "$1,500.00",
    status: "paid",
    plan: "Pro",
  },
];

export default function Billing() {
  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Billing & Usage</h1>
          <p className="mt-1 text-muted-foreground">
            Monitor your usage and manage billing
          </p>
        </div>
        <Button className="bg-gradient-primary">Upgrade Plan</Button>
      </div>

      {/* Current Plan */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-display">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">Business Plan</h3>
                <Badge variant="outline">Active</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">
                $2,000/month • Billed monthly
              </p>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {usageMetrics.map((metric) => (
          <Card key={metric.name} className="card-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                {metric.percentage >= 80 && (
                  <AlertCircle className="h-4 w-4 text-warning" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">
                    {metric.used.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                  </span>
                </div>
                <Progress value={metric.percentage} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{metric.percentage}% used</span>
                  <span>
                    {metric.limit - metric.used} {metric.unit} remaining
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-display">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date} • {invoice.plan}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{invoice.amount}</span>
                  <Badge variant="outline" className="status-pass">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

