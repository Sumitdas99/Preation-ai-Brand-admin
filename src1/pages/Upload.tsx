import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileVideo, FileImage, X, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "complete" | "error";
}

export default function Upload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [channel, setChannel] = useState("instagram");
  const [geo, setGeo] = useState("eu");
  const [autoDisclosure, setAutoDisclosure] = useState(true);
  const [autoC2PA, setAutoC2PA] = useState(true);

  const startPreFlight = () => {
    const target = files[0];
    if (!target) return;
    navigate(`/preflight/${target.id}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress = Math.min(progress + 10, 100);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  progress,
                  status: progress >= 100 ? "complete" : "uploading",
                }
              : f
          )
        );
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    });

    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Upload Assets</h1>
        <p className="mt-1 text-muted-foreground">
          Upload media files for compliance analysis and pre-flight checks
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Select Files</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 transition-colors hover:border-primary hover:bg-accent/50"
              >
                <UploadIcon className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">
                  Drop files here or click to browse
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supports images, videos up to 2GB
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <FileImage className="h-5 w-5 text-primary" />
                        ) : (
                          <FileVideo className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress value={file.progress} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {file.progress}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatSize(file.size)}
                        </p>
                      </div>
                      {file.status === "complete" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Distribution Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="meta-ads">Meta Ads</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Geography</Label>
                <Select value={geo} onValueChange={setGeo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="it">Italy</SelectItem>
                    <SelectItem value="es">Spain</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate Disclosure</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically add compliance overlays
                    </p>
                  </div>
                  <Switch
                    checked={autoDisclosure}
                    onCheckedChange={setAutoDisclosure}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-embed C2PA</Label>
                    <p className="text-xs text-muted-foreground">
                      Add content credentials automatically
                    </p>
                  </div>
                  <Switch checked={autoC2PA} onCheckedChange={setAutoC2PA} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-gradient-primary"
            size="lg"
            disabled={files.length === 0}
            onClick={startPreFlight}
          >
            Start Pre-flight Check
          </Button>
        </div>
      </div>
    </div>
  );
}
