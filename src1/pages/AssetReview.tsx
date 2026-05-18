import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

export default function AssetReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [detectionOpen, setDetectionOpen] = useState(true);
  const [suitabilityOpen, setSuitabilityOpen] = useState(true);
  const [policyOpen, setPolicyOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);

  const asset = {
    name: "spring-campaign-hero.mp4",
    uploaded: "10 minutes ago",
    syntheticScore: 85,
    c2paStatus: "Valid",
    faceVoicePresent: true,
    violations: [
      "Missing AI disclosure (85% synthetic confidence)",
      "Possible alcohol content at 0:23-0:45"
    ]
  };

  const handleGenerateDisclosure = () => {
    navigate(`/disclosure/${id}`);
  };

  const handleMarkReviewed = () => {
    toast({
      title: "Marked as Reviewed",
      description: "Asset has been marked as reviewed and approved.",
    });
  };

  const handleSendToLegal = () => {
    toast({
      title: "Sent to Legal",
      description: "Asset forwarded to legal team for review.",
    });
  };

  const handlePreFlightCheck = () => {
    navigate(`/preflight/${id}`);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/assets")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Asset Review</h1>
            <p className="text-sm text-muted-foreground">
              {asset.name} • Uploaded {asset.uploaded}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <Card className="flex-1 flex flex-col card-shadow">
            <div className="relative flex-1 bg-muted rounded-t-lg flex items-center justify-center min-h-[400px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">🎬</div>
              </div>
              
              <div className="absolute top-20 left-20 border-2 border-danger rounded w-32 h-24 animate-pulse"></div>
              <div className="absolute bottom-32 right-24 border-2 border-warning rounded w-24 h-16"></div>
              
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1 rounded-md text-sm font-medium">
                Frame 245 / 1200
              </div>
            </div>

            <div className="p-4 bg-card border-t border-border">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Play
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="mt-4 bg-warning-light border-warning card-shadow">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning-foreground mb-2">
                    Violations Detected
                  </h3>
                  <ul className="space-y-1 text-sm text-warning-foreground">
                    {asset.violations.map((violation, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{violation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-4">
            <Button variant="destructive" size="lg">
              Reject Asset
            </Button>
            <Button variant="outline" size="lg">
              Request Changes
            </Button>
            <Button variant="outline" size="lg" className="ml-auto">
              Save Draft
            </Button>
            <Button size="lg" className="bg-success hover:bg-success/90" onClick={handlePreFlightCheck}>
              Pre-Flight Check
            </Button>
          </div>
        </div>

        <div className="w-[400px] border-l border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-4">
            <Collapsible open={detectionOpen} onOpenChange={setDetectionOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Detection Results
                      <span className="text-muted-foreground text-sm">
                        {detectionOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Synthetic Content</span>
                        <Badge variant="destructive" className="ml-auto">
                          {asset.syntheticScore}%
                        </Badge>
                      </div>
                      <Progress 
                        value={asset.syntheticScore} 
                        className="h-2"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">C2PA Status</span>
                      <Badge className="bg-success text-success-foreground">
                        {asset.c2paStatus}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Face/Voice Present</span>
                      <Badge className="bg-warning text-warning-foreground">
                        {asset.faceVoicePresent ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={suitabilityOpen} onOpenChange={setSuitabilityOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Brand Suitability
                      <span className="text-muted-foreground text-sm">
                        {suitabilityOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🍺</span>
                          <span className="text-sm font-medium">Alcohol</span>
                        </div>
                        <Badge variant="destructive">62%</Badge>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="text-sm font-medium">Minors</span>
                        </div>
                        <Badge className="bg-success text-success-foreground">3%</Badge>
                      </div>
                      <Progress value={3} className="h-2" />
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚔️</span>
                          <span className="text-sm font-medium">Violence</span>
                        </div>
                        <Badge className="bg-success text-success-foreground">0%</Badge>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={policyOpen} onOpenChange={setPolicyOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Policy Compliance
                      <span className="text-muted-foreground text-sm">
                        {policyOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">EU Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-danger"></div>
                        <span className="text-sm text-muted-foreground">Red</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">US Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-warning"></div>
                        <span className="text-sm text-muted-foreground">Yellow</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">APAC Policy</span>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-success"></div>
                        <span className="text-sm text-muted-foreground">Green</span>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
              <Card className="card-shadow">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Required Actions
                      <span className="text-muted-foreground text-sm">
                        {actionsOpen ? "−" : "+"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    <ol className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li>1. Add AI disclosure to video</li>
                      <li>2. Review alcohol content</li>
                      <li>3. Attach model consent</li>
                    </ol>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleGenerateDisclosure}
                    >
                      Generate Disclosure
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleMarkReviewed}
                    >
                      Mark as Reviewed
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleSendToLegal}
                    >
                      Send to Legal
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
