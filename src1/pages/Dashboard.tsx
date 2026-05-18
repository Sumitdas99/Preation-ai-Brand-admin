import { FileText, CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { WelcomeBillingBannerContainer, DevBillingPanel, useActiveBrandId, useBrand } from "@/features/billing";

const kpis = [
  {
    title: "Content Credentials",
    value: "87%",
    change: "+5.2%",
    trend: "up",
    icon: FileText,
    status: "success" as const,
  },
  {
    title: "AI Disclosures",
    value: "92%",
    change: "+2.1%",
    trend: "up",
    icon: CheckCircle2,
    status: "success" as const,
  },
  {
    title: "Open Violations",
    value: "23",
    change: "-8",
    trend: "down",
    icon: AlertTriangle,
    status: "warning" as const,
  },
  {
    title: "Avg Approval Time",
    value: "4.2h",
    change: "-0.5h",
    trend: "down",
    icon: Clock,
    status: "success" as const,
  },
];

const recentAssets = [
  {
    id: "1",
    name: "campaign_hero_2024.mp4",
    status: "pass",
    synthetic: 98,
    suitability: "Compliant",
    c2pa: true,
    timestamp: "2 mins ago",
    thumbnail: "🎬",
  },
  {
    id: "2",
    name: "product_showcase.jpg",
    status: "flag",
    synthetic: 76,
    suitability: "Review Required",
    c2pa: false,
    timestamp: "15 mins ago",
    thumbnail: "📸",
  },
  {
    id: "3",
    name: "social_ad_v3.png",
    status: "processing",
    synthetic: null,
    suitability: "Processing...",
    c2pa: null,
    timestamp: "Just now",
    thumbnail: "🖼️",
  },
  {
    id: "4",
    name: "testimonial_video.mp4",
    status: "pass",
    synthetic: 15,
    suitability: "Compliant",
    c2pa: true,
    timestamp: "1 hour ago",
    thumbnail: "🎬",
  },
  {
    id: "5",
    name: "brand_banner.png",
    status: "block",
    synthetic: 95,
    suitability: "Non-Compliant",
    c2pa: false,
    timestamp: "2 hours ago",
    thumbnail: "🖼️",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const brandId = useActiveBrandId();
  const { brand } = useBrand(brandId);

  const handleGenerateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your compliance report is being generated...",
    });
  };

  return (
    <div className="animate-fade-in">
      <DashboardTopBar
        title="Dashboard"
        role="Brand Admin"
        workspace={brand?.brand_name ?? "Workspace"}
      />
      <WelcomeBillingBannerContainer />
      <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your compliance status and recent activity
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleGenerateReport}>
            Generate Report
          </Button>
          <Button className="bg-gradient-primary" onClick={() => navigate("/upload")}>
            Upload Assets
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="card-shadow hover:card-shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold font-display">{kpi.value}</div>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-success" />
                    )}
                    <span className="font-medium text-success">{kpi.change}</span>
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    kpi.status === "success"
                      ? "bg-success-light"
                      : kpi.status === "warning"
                      ? "bg-warning-light"
                      : "bg-danger-light"
                  }`}
                >
                  <kpi.icon
                    className={`h-6 w-6 ${
                      kpi.status === "success"
                        ? "text-success"
                        : kpi.status === "warning"
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-display">Recent Assets</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest uploads and their compliance status
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/assets")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-2xl">
                  {asset.thumbnail}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{asset.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        asset.status === "pass"
                          ? "status-pass"
                          : asset.status === "flag"
                          ? "status-flag"
                          : asset.status === "block"
                          ? "status-block"
                          : "status-processing"
                      }
                    >
                      {asset.status === "pass"
                        ? "Pass"
                        : asset.status === "flag"
                        ? "Review"
                        : asset.status === "block"
                        ? "Block"
                        : "Processing"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{asset.timestamp}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Synthetic</p>
                    {asset.synthetic !== null ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={asset.synthetic} className="h-2 w-16" />
                        <span className="font-medium">{asset.synthetic}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">C2PA</p>
                    <p className="mt-1 font-medium">
                      {asset.c2pa === null ? "-" : asset.c2pa ? "✓" : "✗"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Suitability</p>
                    <p className="mt-1 font-medium">{asset.suitability}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/assets`)}>
                  Review
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <DevBillingPanel scenarioIds={["trial-active", "welcome-payment-required", "welcome-activate"]} showRoleToggle />
      </div>
    </div>
  );
}
