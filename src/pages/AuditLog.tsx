import { useState, useEffect } from "react";
import { FileSearch, Search, Download, Calendar, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuditLogs } from "@/api/audit";
import { format } from "date-fns";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/DataTablePagination";

const actionTypes = [
  "All Actions",
  "asset_upload",
  "asset_approved",
  "asset_rejected",
  "policy_updated",
  "preflight_scan_completed",
  "user_created",
  "user_deleted",
];

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("All Actions");
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 20;

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const trimmedSearch = searchQuery.trim();
      const response = await getAuditLogs({
        page: currentPage,
        limit,
        action: selectedAction === "All Actions" ? null : selectedAction,
        search: trimmedSearch ? trimmedSearch : null,
      });
      setLogs(response.items || []);
      setTotalPages(response.pages || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error(error.message || "Failed to load audit logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedAction]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Audit Log</h1>
          <p className="mt-1 text-muted-foreground">
            Immutable record of all system actions and events
          </p>
        </div>
        {/* <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button> */}
      </div>
 
      {/* Filters */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-display">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by asset name, action, resource, or status..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedAction}
              onValueChange={(val) => {
                setSelectedAction(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === "All Actions" ? "All Actions" : action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
          </form>
        </CardContent>
      </Card>
 
      {/* Audit Events */}
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-display">Audit Events ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <FileSearch className="mb-2 h-12 w-12 opacity-20" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Status</TableHead>
                      {/* <TableHead>Details</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.log_id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                          </div>
                        </TableCell>
                         <TableCell className="max-w-[240px] truncate text-sm">
                          {log?.details?.filename || "-"}
                        </TableCell>
                        <TableCell className="text-sm max-w-[180px] truncate">
                          {log.user_name || log.user_id || "System"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.resource}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.status === "success" || log.status === "SUCCESS" ? "default" : "destructive"}
                            className={log.status === "success" || log.status === "SUCCESS" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        {/* <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {log.details ? JSON.stringify(log.details) : "-"}
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalItems}
                pageSize={limit}
                onPageChange={setCurrentPage}
                align="between"
                itemLabel="logs"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary bg-primary-light/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileSearch className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">About Audit Logs</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                All audit logs are stored in WORM (Write Once Read Many) storage and cannot be
                modified or deleted. This ensures complete traceability for regulatory compliance
                and legal audits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

