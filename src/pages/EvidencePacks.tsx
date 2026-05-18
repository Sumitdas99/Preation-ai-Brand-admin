import { useState } from "react";
import { Package, Download, Eye, Search, FileText, Calendar } from "lucide-react";
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

const evidencePacks = [
  {
    id: "evd_2025_10_20_323456",
    assetName: "spring-campaign-bars.mp4",
    assetId: "ast_123",
    status: "Generated",
    syntheticConfidence: 86,
    c2paStatus: "Valid",
    createdAt: "2024-10-20 14:30",
    size: "2.4 MB",
  },
  {
    id: "evd_2025_10_19_123789",
    assetName: "product-launch-ad.jpg",
    assetId: "ast_456",
    status: "Generated",
    syntheticConfidence: 12,
    c2paStatus: "Not Present",
    createdAt: "2024-10-19 10:15",
    size: "1.8 MB",
  },
  {
    id: "evd_2025_10_18_987654",
    assetName: "social-ad-v3.png",
    assetId: "ast_789",
    status: "Pending",
    syntheticConfidence: null,
    c2paStatus: null,
    createdAt: "2024-10-18 16:45",
    size: "-",
  },
];

export default function EvidencePacks() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredPacks = evidencePacks.filter(
    (pack) =>
      pack.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Evidence Packs</h1>
          <p className="text-[14px] text-muted-foreground">
            Compliance evidence packs for all processed assets
          </p>
        </div>
      </div>

      {/* Evidence Packs List */}
      <Card className="card-shadow">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-display">All Evidence Packs</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search evidence packs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-background">
                <TableHead>Evidence ID</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Synthetic %</TableHead>
                <TableHead>C2PA Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacks.map((pack) => (
                <TableRow className="relative" key={pack.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{pack.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/assets/${pack.assetId}`)}
                      className="text-primary text-left hover:underline"
                    >
                      {pack.assetName}
                    </button>
                  </TableCell>
                  <TableCell>
                    {pack.syntheticConfidence !== null ? (
                      <span className="font-medium">{pack.syntheticConfidence}%</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pack.c2paStatus ? (
                      <Badge
                        variant={pack.c2paStatus === "Valid" ? "default" : "secondary"}
                        className={pack.c2paStatus === "Valid" ? "status-pass" : ""}
                      >
                        {pack.c2paStatus}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={pack.status === "Generated" ? "default" : "secondary"}
                      className={pack.status === "Generated" ? "status-pass" : "status-processing"}
                    >
                      {pack.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {pack.createdAt}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{pack.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {pack.status === "Generated" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/assets/${pack.assetId}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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

