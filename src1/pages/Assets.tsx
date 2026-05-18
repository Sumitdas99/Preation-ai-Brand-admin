import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const assets = [
  {
    id: "1",
    name: "campaign_hero_2024.mp4",
    type: "video",
    status: "pass",
    synthetic: 98,
    suitability: "Compliant",
    c2pa: true,
    uploaded: "2 mins ago",
    thumbnail: "🎬",
  },
  {
    id: "2",
    name: "product_showcase.jpg",
    type: "image",
    status: "flag",
    synthetic: 76,
    suitability: "Review Required",
    c2pa: false,
    uploaded: "15 mins ago",
    thumbnail: "📸",
  },
  {
    id: "3",
    name: "social_ad_v3.png",
    type: "image",
    status: "processing",
    synthetic: null,
    suitability: "Processing...",
    c2pa: null,
    uploaded: "Just now",
    thumbnail: "🖼️",
  },
  {
    id: "4",
    name: "testimonial_video.mp4",
    type: "video",
    status: "pass",
    synthetic: 15,
    suitability: "Compliant",
    c2pa: true,
    uploaded: "1 hour ago",
    thumbnail: "🎬",
  },
  {
    id: "5",
    name: "brand_banner.png",
    type: "image",
    status: "block",
    synthetic: 95,
    suitability: "Non-Compliant",
    c2pa: false,
    uploaded: "2 hours ago",
    thumbnail: "🖼️",
  },
  {
    id: "6",
    name: "instagram_story_01.mp4",
    type: "video",
    status: "pass",
    synthetic: 22,
    suitability: "Compliant",
    c2pa: true,
    uploaded: "3 hours ago",
    thumbnail: "🎬",
  },
  {
    id: "7",
    name: "email_header.jpg",
    type: "image",
    status: "flag",
    synthetic: 82,
    suitability: "Review Required",
    c2pa: false,
    uploaded: "5 hours ago",
    thumbnail: "📸",
  },
  {
    id: "8",
    name: "youtube_thumbnail.png",
    type: "image",
    status: "pass",
    synthetic: 8,
    suitability: "Compliant",
    c2pa: true,
    uploaded: "1 day ago",
    thumbnail: "🖼️",
  },
];

export default function Assets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAssets = assets.filter((asset) => {
    if (!asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && asset.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Recent Assets</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all uploaded assets
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>

      <Card className="card-shadow">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="flag">Flagged</SelectItem>
                <SelectItem value="block">Blocked</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="card-shadow hover:card-shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary text-4xl">
                  {asset.thumbnail}
                </div>
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-sm text-muted-foreground">{asset.uploaded}</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Synthetic</span>
                    {asset.synthetic !== null ? (
                      <span className="font-medium">{asset.synthetic}%</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                  {asset.synthetic !== null && (
                    <Progress value={asset.synthetic} className="h-2" />
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">C2PA</span>
                  <span className="font-medium">
                    {asset.c2pa === null ? "-" : asset.c2pa ? "✓ Present" : "✗ Missing"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Suitability</span>
                  <span className="font-medium">{asset.suitability}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => navigate(`/assets/${asset.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
