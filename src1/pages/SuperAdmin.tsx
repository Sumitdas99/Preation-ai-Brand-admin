import { Building2, Users, CreditCard, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const metrics = [
  {
    title: "Active Workspaces",
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

const topWorkspaces = [
  { name: "Acme Corp", users: 145, usage: 87, plan: "Enterprise", health: "healthy" },
  { name: "TechStart Inc", users: 89, usage: 92, plan: "Business", health: "warning" },
  { name: "Creative Agency", users: 67, usage: 45, plan: "Business", health: "healthy" },
  { name: "MediaCo", users: 234, usage: 98, plan: "Enterprise", health: "critical" },
  { name: "BrandWorks", users: 52, usage: 34, plan: "Pro", health: "healthy" },
];

export default function SuperAdmin() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Super Admin Console</h1>
          <p className="mt-1 text-muted-foreground">
            Platform-wide monitoring and workspace management
          </p>
        </div>
        <Button className="bg-gradient-primary">Create Workspace</Button>
      </div>

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

      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display">Top Workspaces</CardTitle>
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
            {topWorkspaces.map((workspace) => (
              <div
                key={workspace.name}
                className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{workspace.name}</p>
                    <Badge variant="outline">{workspace.plan}</Badge>
                    {workspace.health === "critical" && (
                      <Badge variant="outline" className="status-block">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Critical
                      </Badge>
                    )}
                    {workspace.health === "warning" && (
                      <Badge variant="outline" className="status-flag">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Warning
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{workspace.users} users</span>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Progress value={workspace.usage} className="h-2 w-24" />
                      <span>{workspace.usage}% usage</span>
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
                { action: "New workspace created", workspace: "DesignStudio", time: "5m ago" },
                { action: "Plan upgraded to Enterprise", workspace: "Acme Corp", time: "1h ago" },
                { action: "Support ticket escalated", workspace: "MediaCo", time: "2h ago" },
                { action: "User limit reached", workspace: "TechStart Inc", time: "3h ago" },
                { action: "Payment method updated", workspace: "BrandWorks", time: "5h ago" },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">{activity.workspace}</p>
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
