import {
  Building2,
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  AlertCircle,
  Bell,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/api/admin";
import { CreateBrandAdminDialog } from "@/components/CreateBrandAdminDialog";

const metrics = [
  {
    title: "Active Brands",
    value: "247",
    change: "+12%",
    icon: Building2,
  },
  {
    title: "Total Users",
    value: "3,482",
    change: "+8%",
    icon: Users,
  },
  {
    title: "Monthly Revenue",
    value: "$127.5K",
    change: "+23%",
    icon: CreditCard,
  },
  {
    title: "API Requests",
    value: "12.4M",
    change: "+15%",
    icon: Activity,
  },
];

const topBrands = [
  { name: "Acme Corp", users: 145, usage: 87, plan: "Enterprise", health: "healthy" },
  { name: "TechStart Inc", users: 89, usage: 92, plan: "Business", health: "warning" },
  { name: "Creative Agency", users: 67, usage: 45, plan: "Business", health: "healthy" },
  { name: "MediaCo", users: 234, usage: 98, plan: "Enterprise", health: "critical" },
  { name: "BrandWorks", users: 52, usage: 34, plan: "Pro", health: "healthy" },
];

const systemAlerts = [
  {
    id: "1",
    type: "high_overrides",
    severity: "warning",
    brand: "MediaCo",
    asset: "campaign_video_2024.mp4",
    description: "Asset has 4 policy overrides",
    syntheticConfidence: 78,
    approvedBy: "Sarah Approver",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "high_synthetic",
    severity: "critical",
    brand: "TechStart Inc",
    asset: "product_launch.mp4",
    description: "92% synthetic confidence but approved",
    syntheticConfidence: 92,
    approvedBy: "John Approver",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "high_overrides",
    severity: "warning",
    brand: "Acme Corp",
    asset: "social_ad_v3.png",
    description: "Asset has 5 policy overrides",
    syntheticConfidence: 65,
    approvedBy: "Alice Approver",
    timestamp: "1 day ago",
  },
];

export default function SuperAdmin() {
  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Super Admin Console</h1>
          <p className="mt-1 text-muted-foreground">
            Platform-wide monitoring and workspace management
          </p>
        </div>
        <CreateBrandAdminDialog defaultTrigger />
      </div>

      {/* Platform Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{metric.value}</div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium text-success">{metric.change}</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Workspaces */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display">Top Brands</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Highest usage and activity in the last 30 days
              </p>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topBrands.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{brand.name}</p>
                    <Badge variant="outline">{brand.plan}</Badge>
                    {brand.health === "critical" && (
                      <Badge variant="outline" className="status-block">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Critical
                      </Badge>
                    )}
                    {brand.health === "warning" && (
                      <Badge variant="outline" className="status-flag">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Warning
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{brand.users} users</span>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Progress value={brand.usage} className="h-2 w-24" />
                      <span>{brand.usage}% usage</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" />
                System Alerts
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Anomaly detection and risk assessment alerts
              </p>
            </div>
            <Badge variant="outline" className="status-warning">
              {systemAlerts.length} Active Alerts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Synthetic %</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Badge
                      variant={alert.severity === "critical" ? "destructive" : "outline"}
                      className={alert.severity === "critical" ? "status-block" : "status-flag"}
                    >
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{alert.brand}</TableCell>
                  <TableCell className="text-sm">{alert.asset}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {alert.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{alert.syntheticConfidence}%</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{alert.approvedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {alert.timestamp}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Notify Admin
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Uptime</span>
                <span className="font-medium text-success">99.97%</span>
              </div>
              <Progress value={99.97} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Detection Service</span>
                <span className="font-medium text-success">100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Database Performance</span>
                <span className="font-medium text-success">98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Capacity</span>
                <span className="font-medium text-warning">78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New brand created", brand: "DesignStudio", time: "5m ago" },
                { action: "Plan upgraded to Enterprise", brand: "Acme Corp", time: "1h ago" },
                { action: "Support ticket escalated", brand: "MediaCo", time: "2h ago" },
                { action: "User limit reached", brand: "TechStart Inc", time: "3h ago" },
                { action: "Payment method updated", brand: "BrandWorks", time: "5h ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">{activity.brand}</p>
                  </div>
                  <span className="text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
