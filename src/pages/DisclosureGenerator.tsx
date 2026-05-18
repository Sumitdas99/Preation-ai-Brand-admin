import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toastSuccess, toastInfo } from "@/utils/toast";

const templates = [
  {
    id: "eu-standard",
    name: "Standard EU AI Act (Article 50)",
    description: "This content was created/edited/manipulated using artificial intelligence systems.",
    text: "This content was created/edited/manipulated using artificial intelligence systems."
  },
  {
    id: "germany-specific",
    name: "Germany Specific (Stricter)",
    description: "Dieses Material wurde mit künstlicher Intelligenz erstellt/bearbeitet.",
    text: "Dieses Material wurde mit künstlicher Intelligenz erstellt/bearbeitet. Diese Offenlegung entspricht den deutschen Transparenzanforderungen."
  },
  {
    id: "industry-standard",
    name: "Creative Industry Standard",
    description: "AI-enhanced imagery. Real product shown.",
    text: "AI-enhanced imagery. Real product shown. This disclosure meets industry transparency standards."
  }
];

export default function DisclosureGenerator() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [disclosureText, setDisclosureText] = useState(templates[0].text);
  const [placements, setPlacements] = useState({
    lowerThird: true,
    videoDescription: false,
    openingTitle: false,
    endScreen: false
  });
  
  const isCompliant = disclosureText.length > 20; // Simple check

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setDisclosureText(template.text);
    }
  };

  const handleApplyDisclosure = () => {
    toastSuccess("AI disclosure has been applied to the asset.", "Disclosure Applied");
    navigate(`/assets/${id}`);
  };

  const handlePreview = () => {
    toastInfo("Opening preview with disclosure overlay...", "Preview Generated");
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/assets/${id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Generate AI Disclosure</h1>
            <p className="text-sm text-muted-foreground">
              Create compliant disclosure for detected AI content
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Template Selection */}
        <div className="w-[400px] border-r border-border bg-card overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-4">Select Disclosure Template</h2>
            </div>

            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all card-shadow ${
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {selectedTemplate === template.id && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Section - Editor & Preview */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Disclosure Editor */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Customize Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="disclosure-text" className="text-sm font-medium mb-2 block">
                    Disclosure Text
                  </Label>
                  <Textarea
                    id="disclosure-text"
                    value={disclosureText}
                    onChange={(e) => setDisclosureText(e.target.value)}
                    className="min-h-[120px] resize-none"
                    placeholder="Enter disclosure text..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Placement Options */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Placement (Video)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lower-third"
                      checked={placements.lowerThird}
                      onCheckedChange={(checked) =>
                        setPlacements({ ...placements, lowerThird: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="lower-third"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Lower third (10 sec)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="video-description"
                      checked={placements.videoDescription}
                      onCheckedChange={(checked) =>
                        setPlacements({ ...placements, videoDescription: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="video-description"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Video description
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="opening-title"
                      checked={placements.openingTitle}
                      onCheckedChange={(checked) =>
                        setPlacements({ ...placements, openingTitle: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="opening-title"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Opening title card
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="end-screen"
                      checked={placements.endScreen}
                      onCheckedChange={(checked) =>
                        setPlacements({ ...placements, endScreen: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="end-screen"
                      className="text-sm font-medium cursor-pointer"
                    >
                      End screen
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {/* <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                  
                  {placements.lowerThird && (
                    <div className="absolute bottom-8 left-8 right-8 bg-background/90 backdrop-blur p-3 rounded-md">
                      <p className="text-xs text-foreground">{disclosureText}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}

            {/* Compliance Check */}
            <Card className={`card-shadow ${isCompliant ? "bg-success/10 border-success" : "bg-warning/10 border-warning"}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {isCompliant ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">Compliance Check</span>
                      <Badge variant={isCompliant ? "default" : "secondary"} className={isCompliant ? "bg-success text-success-foreground" : ""}>
                        {isCompliant ? "Pass" : "Review Needed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isCompliant
                        ? "This disclosure meets EU AI Act Article 50 requirements for Germany."
                        : "Disclosure text should be more detailed to meet compliance requirements."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreview}
                className="flex-1"
              >
                Preview
              </Button>
              <Button
                size="lg"
                onClick={handleApplyDisclosure}
                className="flex-1"
                disabled={!isCompliant}
              >
                Apply Disclosure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
