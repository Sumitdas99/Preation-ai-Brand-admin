import { useState } from "react";
import { AlertTriangle, Filter, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const violations = [
  {
    id: "1",
    assetName: "product_showcase.jpg",
    type: "Synthetic Detection",
    severity: "high",
    description: "AI-generated content detected without proper disclosure",
    detected: "15 mins ago",
    status: "open",
  },
  {
    id: "2",
    assetName: "brand_banner.png",
    type: "C2PA Missing",
    severity: "critical",
    description: "No content credentials found",
    detected: "2 hours ago",
    status: "open",
  },
  {
    id: "3",
    assetName: "social_ad_v2.mp4",
    type: "Brand Suitability",
    severity: "medium",
    description: "Content flagged for alcohol reference",
    detected: "5 hours ago",
    status: "reviewing",
  },
  {
    id: "4",
    assetName: "testimonial_raw.jpg",
    type: "Consent Missing",
    severity: "high",
    description: "Person detected without consent documentation",
    detected: "1 day ago",
    status: "resolved",
  },
  {
    id: "5",
    assetName: "campaign_hero.mp4",
    type: "Geo Compliance",
    severity: "critical",
    description: "Violates EU AI Act Article 50 requirements",
    detected: "1 day ago",
    status: "open",
  },
];

export default function Violations() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredViolations = violations.filter((violation) => {
    if (severityFilter !== "all" && violation.severity !== severityFilter) return false;
    if (statusFilter !== "all" && violation.status !== statusFilter) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "status-block";
      case "high":
        return "status-flag";
      case "medium":
        return "status-processing";
      default:
        return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "status-pass";
      case "reviewing":
        return "status-processing";
      default:
        return "status-flag";
    }
  };

  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Violations</h1>
          <p className="text-[14px] text-muted-foreground">
            Review and manage compliance violations
          </p>
        </div>
        <Button variant="outline" className="border-[hsl(217_91%_32%)]
    text-[hsl(217_91%_32%)]
    font-semibold
    bg-transparent

    /* REMOVE FOCUS STYLES */
    focus:outline-none
    focus-visible:outline-none
    focus:ring-0
    focus-visible:ring-0
    focus:ring-offset-0
    focus-visible:ring-offset-0
    focus:shadow-none
    focus-visible:shadow-none

    /* HOVER EFFECT */
    hover:bg-[hsl(217_91%_32%/0.08)]

    /* ACTIVE */
    active:translate-y-0
    active:scale-[0.98]

    transition-all
    duration-200
    ease-out">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="mt-1 text-2xl font-bold font-display">23</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger-light">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reviewing</p>
                <p className="mt-1 text-2xl font-bold font-display">12</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-light">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="mt-1 text-2xl font-bold font-display">47</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-light">
                <AlertTriangle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="mt-1 text-2xl font-bold font-display">2.3h</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <AlertTriangle className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Violations Table */}
      <Card className="card-shadow">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-display">All Violations</CardTitle>
            <div className="flex gap-3">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <thead>
              <TableRow className="bg-background">
                <TableHead>Asset</TableHead>
                <TableHead>Violation Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </thead>
            <TableBody>
              {filteredViolations.map((violation) => (
                <TableRow className="relative" key={violation.id}>
                  <TableCell className="font-medium">{violation.assetName}</TableCell>
                  <TableCell>{violation.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {violation.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {violation.detected}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(violation.status)}>
                      {violation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Button>
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
