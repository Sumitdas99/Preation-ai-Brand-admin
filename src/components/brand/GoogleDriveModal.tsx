
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
    HardDrive,
    Users,
    Clock,
    Star,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listGoogleFiles } from "@/api/brand";

interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    iconLink: string;
    thumbnailLink?: string;
    size?: string;
    modifiedTime?: string;
}

interface GoogleDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandId: string;
    onImport: (files: GoogleDriveFile[]) => void;
    mode?: 'file_picker' | 'folder_picker';
    /** When true, only one file or folder can be selected at a time */
    singleSelect?: boolean;
}

interface BreadcrumbItem {
    id: string;
    name: string;
}

type FileTypeFilter = 'all' | 'image' | 'video' | 'document';
type SectionType = 'my_drive' | 'shared_with_me' | 'recent' | 'starred' | 'trash';

export function GoogleDriveModal({
    isOpen,
    onClose,
    brandId,
    onImport,
    mode = 'file_picker',
    singleSelect = false,
}: GoogleDriveModalProps) {
    const [files, setFiles] = useState<GoogleDriveFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Filters and Sections
    const [activeFilter, setActiveFilter] = useState<FileTypeFilter>('all');
    const [activeSection, setActiveSection] = useState<SectionType>('my_drive');

    // Folder Navigation
    const [currentFolderId, setCurrentFolderId] = useState("root");
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "My Drive" }]);

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
            setBreadcrumbs([{ id: "root", name: "My Drive" }]);
            setActiveFilter('all');
            setActiveSection('my_drive');
        }
    }, [isOpen, brandId]);

    // Fetch when params change
    useEffect(() => {
        if (isOpen && brandId !== undefined) {
            setFiles([]);
            setNextPageToken(null);
            fetchFiles(undefined, debouncedSearch, currentFolderId, activeFilter, activeSection);
        }
    }, [debouncedSearch, currentFolderId, activeFilter, activeSection, isOpen, brandId]);


    const fetchFiles = async (pageToken?: string, query?: string, folderId: string = 'root', filter: FileTypeFilter = 'all', section: SectionType = 'my_drive') => {
        setIsLoading(true);
        setError(null);
        try {
            const activeFolderId = query ? undefined : folderId;
            const typeFilter = filter === 'all' ? null : filter;

            const response = await listGoogleFiles(brandId, pageToken, query, activeFolderId, typeFilter, section);

            const newFiles = response.files || [];
            const token = response.nextPageToken || null;

            setFiles(prev => pageToken ? [...prev, ...newFiles] : newFiles);
            setNextPageToken(token);
        } catch (err: any) {
            console.error("Failed to fetch Drive files:", err);
            if (err.message && err.message.includes("not connected")) {
                setError("Google Drive is not connected for this brand. Please go to Settings to connect.");
            } else {
                setError("Failed to load files from Google Drive.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (nextPageToken) {
            fetchFiles(nextPageToken, debouncedSearch, currentFolderId, activeFilter, activeSection);
        }
    };

    const handleSectionChange = (section: SectionType) => {
        setActiveSection(section);
        // Reset navigation for My Drive, or irrelevant for others
        setCurrentFolderId("root");
        setBreadcrumbs([{ id: "root", name: section === 'my_drive' ? "My Drive" : getSectionLabel(section) }]);
        setSearchQuery(""); // Optional: clear search on section switch?
    };

    const handleItemClick = (file: GoogleDriveFile) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            if (mode === 'folder_picker') {
                // In folder picker, clicking select logic could be different
                // But usually we navigate on click, and have a checkbox for selection
                // Let's allow navigation on single click, and selection via checkbox?
                // Or if we want to SELECT the folder, we might need a specific action.
                // Current UX: Single click navigates.
                // Let's KEEP single click to navigate, but checkbox to select.
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
        if (singleSelect) {
            if (selectedFiles.has(fileId)) {
                setSelectedFiles(new Set());
            } else {
                setSelectedFiles(new Set([fileId]));
            }
        } else {
            const newSelection = new Set(selectedFiles);
            if (newSelection.has(fileId)) {
                newSelection.delete(fileId);
            } else {
                newSelection.add(fileId);
            }
            setSelectedFiles(newSelection);
        }
    };

    const handleImportClick = () => {
        const selectedList = files.filter(f => selectedFiles.has(f.id));
        onImport(selectedList);
        onClose();
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes("folder")) return <Folder className="h-5 w-5 text-blue-500 fill-blue-500/20" />;
        if (mimeType.includes("image")) return <ImageIcon className="h-5 w-5 text-purple-500" />;
        if (mimeType.includes("video")) return <Film className="h-5 w-5 text-red-500" />;
        if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("sheet")) return <FileText className="h-5 w-5 text-orange-500" />;
        return <File className="h-5 w-5 text-gray-400" />;
    };

    const formatSize = (bytes?: string) => {
        if (!bytes) return "";
        const b = parseInt(bytes);
        if (b < 1024) return b + " B";
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
        return (b / (1024 * 1024)).toFixed(1) + " MB";
    };

    const getFilterLabel = () => {
        switch (activeFilter) {
            case 'image': return 'Images';
            case 'video': return 'Videos';
            case 'document': return 'Documents';
            default: return 'All Files';
        }
    };

    const getSectionLabel = (section: SectionType) => {
        switch (section) {
            case 'my_drive': return 'My Drive';
            case 'shared_with_me': return 'Shared with me';
            case 'recent': return 'Recent';
            case 'starred': return 'Starred';
            case 'trash': return 'Trash';
            default: return '';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 px-6 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                                alt="Drive"
                                className="h-6 w-6"
                            />
                            {mode === 'folder_picker' ? 'Select Folder to Watch' : 'Import from Google Drive'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-[200px] bg-muted/10 border-r flex flex-col py-4 gap-1">
                        <Button
                            variant={activeSection === 'my_drive' ? 'secondary' : 'ghost'}
                            className="justify-start px-4 gap-2 rounded-none lg:rounded-r-full mr-2"
                            onClick={() => handleSectionChange('my_drive')}
                        >
                            <HardDrive className="h-4 w-4" />
                            My Drive
                        </Button>
                        <Button
                            variant={activeSection === 'shared_with_me' ? 'secondary' : 'ghost'}
                            className="justify-start px-4 gap-2 rounded-none lg:rounded-r-full mr-2"
                            onClick={() => handleSectionChange('shared_with_me')}
                        >
                            <Users className="h-4 w-4" />
                            Shared with me
                        </Button>
                        <Button
                            variant={activeSection === 'recent' ? 'secondary' : 'ghost'}
                            className="justify-start px-4 gap-2 rounded-none lg:rounded-r-full mr-2"
                            onClick={() => handleSectionChange('recent')}
                        >
                            <Clock className="h-4 w-4" />
                            Recent
                        </Button>
                        <Button
                            variant={activeSection === 'starred' ? 'secondary' : 'ghost'}
                            className="justify-start px-4 gap-2 rounded-none lg:rounded-r-full mr-2"
                            onClick={() => handleSectionChange('starred')}
                        >
                            <Star className="h-4 w-4" />
                            Starred
                        </Button>
                        <Button
                            variant={activeSection === 'trash' ? 'secondary' : 'ghost'}
                            className="justify-start px-4 gap-2 rounded-none lg:rounded-r-full mr-2"
                            onClick={() => handleSectionChange('trash')}
                        >
                            <Trash2 className="h-4 w-4" />
                            Trash
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
                        {/* Toolbar */}
                        <div className="p-4 border-b bg-background/50 flex flex-col gap-3">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={`Search in ${getSectionLabel(activeSection)}...`}
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-2 min-w-[100px]">
                                            <Filter className="h-4 w-4" />
                                            <span className="hidden sm:inline">{getFilterLabel()}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setActiveFilter('all')}>All Files</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActiveFilter('image')}>Images</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActiveFilter('video')}>Videos</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setActiveFilter('document')}>Documents</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex border rounded-md">
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-r-none h-10 w-10"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <ListIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                                        size="icon"
                                        className="rounded-l-none h-10 w-10"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Breadcrumbs - Only for My Drive mostly, but kept for context if we support folder nav in other sections */}
                            {!debouncedSearch && activeSection === 'my_drive' && (
                                <div className="flex items-center gap-1 text-sm overflow-x-auto pb-1 scrollbar-none">
                                    {breadcrumbs.map((item, index) => (
                                        <div key={item.id} className="flex items-center whitespace-nowrap">
                                            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                                            <button
                                                onClick={() => handleBreadcrumbClick(item, index)}
                                                className={`hover:bg-muted px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${index === breadcrumbs.length - 1 ? 'font-semibold text-foreground pointer-events-none' : 'text-muted-foreground'}`}
                                            >
                                                {index === 0 && <Home className="h-3.5 w-3.5" />}
                                                {item.name}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* File List */}
                        <div className="flex-1 overflow-hidden p-4">
                            {error ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                                    <AlertCircle className="h-10 w-10 mb-2 text-destructive" />
                                    <p className="font-medium text-foreground">{error}</p>
                                    <Button variant="link" onClick={() => fetchFiles(undefined, debouncedSearch, currentFolderId, activeFilter, activeSection)} className="mt-2">
                                        Try Again
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground px-1">
                                        <span>{files.length} items</span>
                                        <span>{singleSelect ? (selectedFiles.size ? "1 selected" : "Select one") : `${selectedFiles.size} selected`}</span>
                                    </div>

                                    <ScrollArea className="flex-1 rounded-md border bg-background shadow-sm">
                                        {files.length === 0 && !isLoading ? (
                                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                                {debouncedSearch ? "No matching files found." : activeSection === 'trash' ? "Trash is empty." : "Folder is empty."}
                                            </div>
                                        ) : (
                                            <>
                                                {viewMode === "list" ? (
                                                    <div className="divide-y">
                                                        {files.map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className={`flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer group ${selectedFiles.has(file.id) ? 'bg-primary/5' : ''}`}
                                                                onClick={() => handleItemClick(file)}
                                                            >
                                                                <div onClick={(e) => { e.stopPropagation(); toggleSelection(file.id); }}>
                                                                    <Checkbox
                                                                        checked={selectedFiles.has(file.id)}
                                                                        className={`mr-2 ${file.mimeType === 'application/vnd.google-apps.folder' && mode === 'file_picker' ? 'invisible' : ''}`}
                                                                    />
                                                                </div>
                                                                <div className="shrink-0 h-10 w-10 flex items-center justify-center bg-secondary/30 rounded">
                                                                    {file.thumbnailLink && file.mimeType !== 'application/vnd.google-apps.folder' ? (
                                                                        <img src={file.thumbnailLink} alt="" className="h-full w-full object-cover rounded opacity-80 group-hover:opacity-100" />
                                                                    ) : (
                                                                        getFileIcon(file.mimeType)
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate font-medium text-sm text-foreground/90">{file.name}</p>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                                                            <span className="font-medium">Folder</span>
                                                                        ) : (
                                                                            <>
                                                                                <span>{file.mimeType.split('/').pop()}</span>
                                                                                {file.size && <span>• {formatSize(file.size)}</span>}
                                                                                {file.modifiedTime && <span>• {new Date(file.modifiedTime).toLocaleDateString()}</span>}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {file.mimeType === 'application/vnd.google-apps.folder' && (
                                                                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                                        {files.map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className={`
                                                                relative group flex flex-col text-left rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer overflow-hidden
                                                                ${selectedFiles.has(file.id) ? 'ring-2 ring-primary bg-accent/50' : ''}
                                                            `}
                                                                onClick={() => handleItemClick(file)}
                                                            >
                                                                <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                                                                    {(file.mimeType !== 'application/vnd.google-apps.folder' || mode === 'folder_picker') && (
                                                                        <Checkbox
                                                                            checked={selectedFiles.has(file.id)}
                                                                            onCheckedChange={() => toggleSelection(file.id)}
                                                                            className={`bg-background/80 backdrop-blur-sm ${!selectedFiles.has(file.id) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                                                                        />
                                                                    )}
                                                                </div>

                                                                <div className="aspect-[4/3] w-full bg-secondary/30 flex items-center justify-center overflow-hidden">
                                                                    {file.thumbnailLink && file.mimeType !== 'application/vnd.google-apps.folder' ? (
                                                                        <img src={file.thumbnailLink} alt="" className="w-full h-full object-cover transform decoration-0 group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                                                                    ) : (
                                                                        <div className="scale-150 transform">
                                                                            {getFileIcon(file.mimeType)}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="p-3">
                                                                    <p className="truncate font-medium text-sm mb-1" title={file.name}>{file.name}</p>
                                                                    {file.mimeType === 'application/vnd.google-apps.folder' ? (
                                                                        <p className="text-xs text-muted-foreground">Folder</p>
                                                                    ) : (
                                                                        <p className="text-xs text-muted-foreground truncate">{formatSize(file.size)}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {isLoading && (
                                            <div className="flex justify-center p-6">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        )}

                                        {!isLoading && nextPageToken && (
                                            <div className="p-4 text-center border-t bg-background">
                                                <Button variant="ghost" size="sm" onClick={handleLoadMore} className="w-full">
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
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImportClick}
                        disabled={selectedFiles.size === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                    >
                        {mode === 'folder_picker' ? 'Select Folder' : 'Import'} {selectedFiles.size > 0 ? (singleSelect ? '' : `(${selectedFiles.size})`) : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
