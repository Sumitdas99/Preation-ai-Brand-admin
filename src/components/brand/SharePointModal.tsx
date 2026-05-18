
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Loader2,
    File,
    Folder,
    Image as ImageIcon,
    FileText,
    Film,
    AlertCircle,
    Search,
    LayoutGrid,
    List as ListIcon,
    ChevronRight,
    Home,
    Filter,
    Cloud,
    Users,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listMicrosoftFiles } from "@/api/brand";

interface SharePointFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    size?: string;
    modifiedTime?: string;
    // Add any other specific fields if needed
}

interface SharePointModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandId: string;
    onImport: (files: SharePointFile[]) => void;
    mode?: 'file_picker' | 'folder_picker';
}

interface BreadcrumbItem {
    id: string;
    name: string;
}

export function SharePointModal({
    isOpen,
    onClose,
    brandId,
    onImport,
    mode = 'file_picker'
}: SharePointModalProps) {
    const [files, setFiles] = useState<SharePointFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Folder Navigation
    const [currentFolderId, setCurrentFolderId] = useState("root");
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "My Files" }]);

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && brandId) {
            setFiles([]);
            setNextPageToken(null);
            setSelectedFiles(new Set());
            setError(null);
            setSearchQuery("");
            setCurrentFolderId("root");
            setBreadcrumbs([{ id: "root", name: "My Files" }]);
        }
    }, [isOpen, brandId]);

    // Fetch when params change
    useEffect(() => {
        if (isOpen && brandId !== undefined) {
            setFiles([]);
            setNextPageToken(null);
            fetchFiles(undefined, debouncedSearch, currentFolderId);
        }
    }, [debouncedSearch, currentFolderId, isOpen, brandId]);


    const fetchFiles = async (pageToken?: string, query?: string, folderId: string = 'root') => {
        setIsLoading(true);
        setError(null);
        try {
            // Note: Backend list_files supports folder_id and page_token.
            // Search query support might implementation specific on backend or handled via page_token logic if Graph supports it differently.
            // For now passing folderId.
            const response = await listMicrosoftFiles(brandId, folderId, pageToken);

            const newFiles = response.files || [];
            const token = response.nextPageToken || null;

            setFiles(prev => pageToken ? [...prev, ...newFiles] : newFiles);
            setNextPageToken(token);
        } catch (err: any) {
            console.error("Failed to fetch SharePoint files:", err);
            if (err.message && err.message.includes("not connected")) {
                setError("SharePoint is not connected for this brand. Please go to Settings to connect.");
            } else {
                setError(err.message || "Failed to load files from SharePoint.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (nextPageToken) {
            fetchFiles(nextPageToken, debouncedSearch, currentFolderId);
        }
    };

    const handleItemClick = (file: SharePointFile) => {
        // Simple heuristic: if mimeType contains 'folder', treat as folder. 
        // Backend returns 'application/folder' or 'application/vnd.google-apps.folder' fallback
        if ((file.mimeType || "").includes('folder')) {
            if (mode === 'folder_picker') {
                setCurrentFolderId(file.id);
                setBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }]);
            } else {
                // Enter folder
                setCurrentFolderId(file.id);
                setBreadcrumbs(prev => [...prev, { id: file.id, name: file.name }]);
            }
        } else {
            // Select file
            if (mode === 'file_picker') {
                toggleSelection(file.id);
            }
        }
    };

    const handleBreadcrumbClick = (item: BreadcrumbItem, index: number) => {
        // Navigate back
        setCurrentFolderId(item.id);
        setBreadcrumbs(prev => prev.slice(0, index + 1));
    };

    const toggleSelection = (fileId: string) => {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(fileId)) {
            newSelection.delete(fileId);
        } else {
            newSelection.add(fileId);
        }
        setSelectedFiles(newSelection);
    };

    const handleImportClick = () => {
        const selectedList = files.filter(f => selectedFiles.has(f.id));
        onImport(selectedList);
        onClose();
    };

    const getFileIcon = (mimeType: string) => {
        const type = mimeType || "";
        // OneDrive Yellow for folders
        if (type.includes("folder")) return <Folder className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />;
        if (type.includes("image")) return <ImageIcon className="h-5 w-5 text-purple-500" />;
        if (type.includes("video")) return <Film className="h-5 w-5 text-red-500" />;
        if (type.includes("pdf") || type.includes("document") || type.includes("sheet")) return <FileText className="h-5 w-5 text-blue-500" />;
        return <File className="h-5 w-5 text-gray-400" />;
    };

    const formatSize = (bytes?: string) => {
        if (!bytes) return "--";
        const b = parseInt(bytes);
        if (b < 1024) return b + " B";
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
        return (b / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[1000px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 px-6 border-b shrink-0 bg-[#0078D4] text-white">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Cloud className="h-6 w-6 text-white" />
                            {mode === 'folder_picker' ? 'Select Folder' : 'OneDrive'}
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 hover:text-white">
                            {/* Close icon would go here but Dialog handles it */}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* OneDrive Sidebar */}
                    <div className="w-60 border-r bg-gray-50/50 flex flex-col p-2 gap-1 pt-4 hidden sm:flex">
                        <Button variant="ghost" className="justify-start gap-3 hover:bg-gray-200/60 font-normal text-muted-foreground">
                            <Home className="h-4 w-4" /> Home
                        </Button>
                        <Button variant="secondary" className="justify-start gap-3 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                            <Folder className="h-4 w-4" /> My files
                        </Button>
                        <Button variant="ghost" className="justify-start gap-3 hover:bg-gray-200/60 font-normal text-muted-foreground">
                            <Users className="h-4 w-4" /> Shared
                        </Button>
                        <Button variant="ghost" className="justify-start gap-3 hover:bg-gray-200/60 font-normal text-muted-foreground">
                            <LayoutGrid className="h-4 w-4" /> Photos
                        </Button>
                        <div className="my-2 border-t mx-2" />
                        <Button variant="ghost" className="justify-start gap-3 hover:bg-gray-200/60 font-normal text-muted-foreground">
                            <Trash2 className="h-4 w-4" /> Recycle bin
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        {/* Toolbar */}
                        <div className="p-2 border-b bg-background flex items-center justify-between gap-3 px-4 h-14">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-none font-medium">
                                {breadcrumbs.map((item, index) => (
                                    <div key={item.id} className="flex items-center whitespace-nowrap">
                                        {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                                        <button
                                            onClick={() => handleBreadcrumbClick(item, index)}
                                            className={`hover:bg-muted px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${index === breadcrumbs.length - 1 ? 'text-foreground cursor-default' : 'text-muted-foreground hover:text-foreground'}`}
                                            disabled={index === breadcrumbs.length - 1}
                                        >
                                            {item.name}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex border rounded-md">
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-r-none h-8 w-8"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-l-none h-8 w-8"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="flex-1 overflow-hidden">
                            {error ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                    <AlertCircle className="h-10 w-10 mb-2 text-destructive" />
                                    <p className="font-medium text-foreground">{error}</p>
                                    <Button variant="link" onClick={() => fetchFiles(undefined, debouncedSearch, currentFolderId)} className="mt-2">
                                        Try Again
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <ScrollArea className="flex-1">
                                        {files.length === 0 && !isLoading ? (
                                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                                {debouncedSearch ? "No matching files found." : "This folder is empty."}
                                            </div>
                                        ) : (
                                            <>
                                                {viewMode === "list" ? (
                                                    <div className="min-w-[600px]">
                                                        {/* Table Header */}
                                                        <div className="sticky top-0 bg-background z-10 grid grid-cols-[auto_1fr_150px_100px_100px] gap-4 px-4 py-2 border-b text-xs font-semibold text-muted-foreground">
                                                            <div className="w-[20px]"></div>
                                                            <div>Name</div>
                                                            <div>Modified</div>
                                                            <div>File size</div>
                                                            <div>Sharing</div>
                                                        </div>
                                                        <div className="divide-y">
                                                            {files.map((file) => (
                                                                <div
                                                                    key={file.id}
                                                                    className={`group grid grid-cols-[auto_1fr_150px_100px_100px] gap-4 items-center px-4 py-2 text-sm hover:bg-muted/50 transition-colors cursor-pointer ${selectedFiles.has(file.id) ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                                                                    onClick={() => handleItemClick(file)}
                                                                >
                                                                    <div className="w-[20px] flex justify-center" onClick={(e) => { e.stopPropagation(); toggleSelection(file.id); }}>
                                                                        {selectedFiles.has(file.id) ? (
                                                                            <Checkbox checked className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                                        ) : (
                                                                            <Checkbox
                                                                                checked={false}
                                                                                className={`data-[state=checked]:bg-blue-600 border-gray-300 ${(!(file.mimeType || "").includes('folder') || mode === 'file_picker') ? "invisible group-hover:visible" : "invisible"}`}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="shrink-0">
                                                                            {getFileIcon(file.mimeType)}
                                                                        </div>
                                                                        <span className={`truncate ${(file.mimeType || "").includes('folder') ? "font-medium text-foreground" : "text-foreground/90"}`}>
                                                                            {file.name}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-muted-foreground text-xs truncate">
                                                                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : "--"}
                                                                    </div>
                                                                    <div className="text-muted-foreground text-xs truncate">
                                                                        {(file.mimeType || "").includes('folder') ?
                                                                            (files.length > 0 ? "" : "") : // Could show item count if available
                                                                            formatSize(file.size)
                                                                        }
                                                                    </div>
                                                                    <div className="text-muted-foreground text-xs">
                                                                        Private
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4">
                                                        {files.map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className={`
                                                                relative group flex flex-col text-left rounded-xl border bg-card hover:bg-accent/50 transition-all cursor-pointer overflow-hidden
                                                                ${selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                                            `}
                                                                onClick={() => handleItemClick(file)}
                                                            >
                                                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    <Checkbox
                                                                        checked={selectedFiles.has(file.id)}
                                                                        onCheckedChange={() => toggleSelection(file.id)}
                                                                        className={`data-[state=checked]:bg-blue-600 border-gray-300 shadow-sm ${!selectedFiles.has(file.id) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                                                    />
                                                                </div>

                                                                <div className="aspect-[4/3] w-full bg-[#f3f2f1] flex items-center justify-center overflow-hidden">
                                                                    <div className="scale-150 transform">
                                                                        {getFileIcon(file.mimeType)}
                                                                    </div>
                                                                </div>

                                                                <div className="p-3">
                                                                    <p className="truncate font-medium text-sm mb-1 text-center" title={file.name}>{file.name}</p>
                                                                    <p className="text-xs text-muted-foreground text-center">
                                                                        {(file.mimeType || "").includes('folder') ? formatSize(file.size) : formatSize(file.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {isLoading && (
                                            <div className="flex justify-center p-6">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                            </div>
                                        )}

                                        {!isLoading && nextPageToken && (
                                            <div className="p-4 text-center border-t bg-background">
                                                <Button variant="ghost" size="sm" onClick={handleLoadMore} className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                    Load More
                                                </Button>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-background shrink-0">
                    <div className="flex-1 flex items-center text-sm text-muted-foreground pl-2">
                        {selectedFiles.size} item(s) selected
                    </div>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportClick}
                        disabled={selectedFiles.size === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                    >
                        {mode === 'folder_picker' ? 'Select Folder' : 'Open'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
