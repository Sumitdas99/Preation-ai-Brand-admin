import { useState } from "react";
import { 
  Blocks, 
  CheckCircle, 
  XCircle, 
  Settings, 
  ExternalLink,
  Cloud,
  MessageSquare,
  Folder,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toastInfo } from "@/utils/toast";

const integrations = [
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Automatically import assets from Google Drive folders",
    icon: Folder,
    category: "Storage",
    connected: true,
    status: "active",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Connect to Microsoft SharePoint for asset monitoring",
    icon: Cloud,
    connected: false,
    status: "inactive",
  },
  {
    id: "s3",
    name: "Amazon S3",
    description: "Monitor S3 buckets for new asset uploads",
    icon: Server,
    connected: false,
    status: "inactive",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receive notifications in Slack channels",
    icon: MessageSquare,
    connected: true,
    status: "active",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    description: "Get real-time updates in Teams",
    icon: MessageSquare,
    connected: false,
    status: "inactive",
  },
];

export default function Integrations() {
  const [integrationsState, setIntegrationsState] = useState(integrations);

  const handleToggle = (id: string) => {
    setIntegrationsState((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              connected: !integration.connected,
              status: integration.connected ? "inactive" : "active",
            }
          : integration
      )
    );
    toastInfo("Integration status has been changed", "Integration updated");
  };

  return (
    <div className="space-y-4 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Integrations</h1>
          <p className="mt-1 text-muted-foreground">
            Connect external services to streamline your workflow
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrationsState.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="card-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="mt-1">{integration.category}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={integration.connected ? "default" : "secondary"}
                    className={integration.connected ? "status-pass" : ""}
                  >
                    {integration.connected ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <XCircle className="mr-1 h-3 w-3" />
                    )}
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {integration.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={integration.id}
                      checked={integration.connected}
                      onCheckedChange={() => handleToggle(integration.id)}
                    />
                    <Label htmlFor={integration.id} className="text-sm">
                      {integration.connected ? "Connected" : "Disconnected"}
                    </Label>
                  </div>
                  {integration.connected && (
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Setup Instructions */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-display">Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to connect your integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium">Enable Integration</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Toggle the switch to enable the integration you want to use
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium">Configure Settings</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click the settings icon to configure connection details and permissions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium">Test Connection</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Verify the integration is working by testing the connection
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

