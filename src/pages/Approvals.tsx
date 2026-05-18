import { useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const pendingApprovals = [
  {
    id: "ast_123",
    assetName: "spring-campaign-bars.mp4",
    submittedBy: "John Reviewer",
    submittedAt: "2 hours ago",
    syntheticConfidence: 85,
    violations: 2,
    priority: "high",
    status: "pending",
  },
  {
    id: "ast_456",
    assetName: "product-launch-ad.jpg",
    submittedBy: "Alice Chen",
    submittedAt: "5 hours ago",
    syntheticConfidence: 12,
    violations: 0,
    priority: "medium",
    status: "pending",
  },
  {
    id: "ast_789",
    assetName: "social-ad-v3.png",
    submittedBy: "Bob Martinez",
    submittedAt: "1 day ago",
    syntheticConfidence: 76,
    violations: 1,
    priority: "high",
    status: "pending",
  },
];

const recentApprovals = [
  {
    id: "ast_111",
    assetName: "testimonial-video.mp4",
    approvedBy: "Sarah Approver",
    approvedAt: "3 hours ago",
    decision: "approved",
    syntheticConfidence: 15,
  },
  {
    id: "ast_222",
    assetName: "brand-banner.png",
    approvedBy: "Sarah Approver",
    approvedAt: "1 day ago",
    decision: "rejected",
    syntheticConfidence: 95,
  },
];

export default function Approvals() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredPending = pendingApprovals.filter(
    (approval) =>
      approval.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.submittedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Pending Approvals</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve assets for compliance
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">{pendingApprovals.length}</div>
            <p className="mt-1 text-sm text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">
              {pendingApprovals.filter((a) => a.priority === "high").length}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display">18min</div>
            <p className="mt-1 text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-display">Pending Approvals</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search approvals..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Synthetic %</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPending.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {approval.priority === "high" && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      <button
                        onClick={() => navigate(`/preflight/${approval.id}`)}
                        className="font-medium text-primary hover:underline"
                      >
                        {approval.assetName}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>{approval.submittedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={approval.syntheticConfidence} className="h-2 w-16" />
                      <span className="text-sm font-medium">{approval.syntheticConfidence}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={approval.violations > 0 ? "destructive" : "default"}>
                      {approval.violations}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={approval.priority === "high" ? "destructive" : "secondary"}
                    >
                      {approval.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {approval.submittedAt}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/preflight/${approval.id}`)}
                    >
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

      {/* Recent Approvals */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-display">Recent Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Synthetic %</TableHead>
                <TableHead>Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">{approval.assetName}</TableCell>
                  <TableCell>{approval.approvedBy}</TableCell>
                  <TableCell>
                    <Badge
                      variant={approval.decision === "approved" ? "default" : "destructive"}
                      className={
                        approval.decision === "approved" ? "status-pass" : "status-block"
                      }
                    >
                      {approval.decision === "approved" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {approval.decision}
                    </Badge>
                  </TableCell>
                  <TableCell>{approval.syntheticConfidence}%</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {approval.approvedAt}
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

