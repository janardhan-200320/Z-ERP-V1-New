import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  Plus,
  Upload,
  Download,
  Trash2,
  Search,
  Image,
  FileText,
  Link as LinkIcon,
  File,
  MoreVertical,
  Calendar,
  User,
  Eye,
  ExternalLink,
  HardDrive,
  Filter,
  Grid,
  List,
  FolderPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SharedFile {
  id: string;
  name: string;
  type: "image" | "pdf" | "document" | "link";
  size: string;
  uploadedBy: string;
  department: string;
  date: string;
  url: string;
  description: string;
  folder: string;
  downloads: number;
  thumbnail?: string;
}

const initialFiles: SharedFile[] = [
  {
    id: "FILE-001",
    name: "Q1-Campaign-Design-v3.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "Emily Davis",
    department: "Design",
    date: "2026-02-16",
    url: "#",
    description: "Updated Q1 marketing campaign design with revised color scheme",
    folder: "Marketing",
    downloads: 12,
  },
  {
    id: "FILE-002",
    name: "Product-Roadmap-2026.pdf",
    type: "pdf",
    size: "1.8 MB",
    uploadedBy: "Mike Chen",
    department: "Development",
    date: "2026-02-15",
    url: "#",
    description: "Product development roadmap for 2026 with milestones and timelines",
    folder: "Development",
    downloads: 28,
  },
  {
    id: "FILE-003",
    name: "hero-banner-final.png",
    type: "image",
    size: "856 KB",
    uploadedBy: "Emily Davis",
    department: "Design",
    date: "2026-02-15",
    url: "#",
    description: "Final hero banner design for landing page refresh",
    folder: "Marketing",
    downloads: 8,
  },
  {
    id: "FILE-004",
    name: "Monthly-Financial-Report.pdf",
    type: "pdf",
    size: "3.1 MB",
    uploadedBy: "Lisa Park",
    department: "Accounts",
    date: "2026-02-14",
    url: "#",
    description: "January 2026 financial summary with P&L statement",
    folder: "Finance",
    downloads: 15,
  },
  {
    id: "FILE-005",
    name: "API-Integration-Guide.pdf",
    type: "document",
    size: "980 KB",
    uploadedBy: "Alex Kumar",
    department: "Development",
    date: "2026-02-14",
    url: "#",
    description: "Step-by-step guide for third-party API integration",
    folder: "Development",
    downloads: 22,
  },
  {
    id: "FILE-006",
    name: "https://figma.com/file/abc123/Design-System",
    type: "link",
    size: "—",
    uploadedBy: "Emily Davis",
    department: "Design",
    date: "2026-02-13",
    url: "https://figma.com/file/abc123/Design-System",
    description: "Company design system and component library in Figma",
    folder: "Design",
    downloads: 0,
  },
  {
    id: "FILE-007",
    name: "team-event-photos.zip",
    type: "image",
    size: "45.2 MB",
    uploadedBy: "Ryan Wilson",
    department: "Operations",
    date: "2026-02-12",
    url: "#",
    description: "Photos from the annual team building event",
    folder: "General",
    downloads: 34,
  },
  {
    id: "FILE-008",
    name: "Employee-Handbook-v4.pdf",
    type: "document",
    size: "2.7 MB",
    uploadedBy: "Sarah Johnson",
    department: "HR",
    date: "2026-02-10",
    url: "#",
    description: "Updated employee handbook with 2026 policy changes",
    folder: "HR",
    downloads: 45,
  },
  {
    id: "FILE-009",
    name: "https://docs.google.com/spreadsheets/d/abc/Sales-Tracker",
    type: "link",
    size: "—",
    uploadedBy: "Sarah Johnson",
    department: "Sales",
    date: "2026-02-10",
    url: "https://docs.google.com/spreadsheets/d/abc/Sales-Tracker",
    description: "Live sales tracking spreadsheet for Q1 2026",
    folder: "Sales",
    downloads: 0,
  },
  {
    id: "FILE-010",
    name: "wireframe-dashboard-v2.png",
    type: "image",
    size: "1.2 MB",
    uploadedBy: "Emily Davis",
    department: "Design",
    date: "2026-02-09",
    url: "#",
    description: "Updated wireframe for the new dashboard layout",
    folder: "Design",
    downloads: 18,
  },
  {
    id: "FILE-011",
    name: "Vendor-Contract-Template.pdf",
    type: "document",
    size: "520 KB",
    uploadedBy: "Ryan Wilson",
    department: "Operations",
    date: "2026-02-08",
    url: "#",
    description: "Standard vendor contract template with updated terms",
    folder: "Operations",
    downloads: 9,
  },
  {
    id: "FILE-012",
    name: "https://miro.com/board/xyz/Sprint-Retro",
    type: "link",
    size: "—",
    uploadedBy: "Mike Chen",
    department: "Development",
    date: "2026-02-07",
    url: "https://miro.com/board/xyz/Sprint-Retro",
    description: "Sprint retrospective board for the development team",
    folder: "Development",
    downloads: 0,
  },
];

const folders = [
  "All",
  "Marketing",
  "Development",
  "Finance",
  "Design",
  "Sales",
  "HR",
  "Operations",
  "General",
];

const departments = [
  "Management",
  "Sales",
  "Design",
  "Development",
  "Marketing",
  "Accounts",
  "Operations",
  "HR",
];

const teamMembers = [
  "Sarah Johnson",
  "Mike Chen",
  "Emily Davis",
  "Alex Kumar",
  "Lisa Park",
  "Ryan Wilson",
];

const CUSTOM_FOLDER_VALUE = "__custom_folder__";
const CUSTOM_SHARED_BY_VALUE = "__custom_shared_by__";
const CUSTOM_DEPARTMENT_VALUE = "__custom_department__";

const emptyFile: Omit<SharedFile, "id"> = {
  name: "",
  type: "document",
  size: "",
  uploadedBy: "",
  department: "",
  date: new Date().toISOString().split("T")[0],
  url: "",
  description: "",
  folder: "General",
  downloads: 0,
};

export default function FileSharingModule() {
  const { toast } = useToast();
  const [files, setFiles] = useState<SharedFile[]>(initialFiles);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<SharedFile, "id">>(emptyFile);
  const [customFolder, setCustomFolder] = useState("");
  const [customSharedBy, setCustomSharedBy] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<SharedFile | null>(null);

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  };

  const resolveTypeFromFile = (file: File): SharedFile["type"] => {
    const mime = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(fileName)) {
      return "image";
    }

    if (mime.includes("pdf") || fileName.endsWith(".pdf")) {
      return "pdf";
    }

    return "document";
  };

  const applySelectedFiles = (selected: File[]) => {
    if (selected.length === 0) return;

    const first = selected[0];
    const detectedType = resolveTypeFromFile(first);
    const totalSize = selected.reduce((sum, current) => sum + current.size, 0);

    setSelectedUploadFiles(selected);
    setFormData((prev) => ({
      ...prev,
      type: selected.length === 1 ? detectedType : "document",
      name:
        selected.length === 1
          ? first.name
          : `${selected.length} files selected`,
      size: formatFileSize(totalSize),
      url: selected.length === 1 ? URL.createObjectURL(first) : "",
    }));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected || selected.length === 0) return;

    applySelectedFiles(Array.from(selected));
  };

  const handlePasteUpload = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (!item.type.startsWith("image/")) continue;
      const pastedFile = item.getAsFile();
      if (!pastedFile) continue;

      event.preventDefault();
      applySelectedFiles([pastedFile]);
      toast({
        title: "Image Pasted",
        description: `${pastedFile.name || "Screenshot"} is ready to share.`,
      });
      break;
    }
  };

  const handleOpenFile = (file: SharedFile) => {
    if (!file.url || file.url === "#") {
      toast({
        title: "Unavailable",
        description: "This file does not have an accessible URL yet.",
        variant: "destructive",
      });
      return;
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadFile = (file: SharedFile) => {
    if (!file.url || file.url === "#") {
      toast({
        title: "Unavailable",
        description: "This file cannot be downloaded right now.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFiles((prev) =>
      prev.map((entry) =>
        entry.id === file.id && entry.type !== "link"
          ? { ...entry, downloads: entry.downloads + 1 }
          : entry
      )
    );
  };

  const handleUpload = () => {
    setFormData(emptyFile);
    setCustomFolder("");
    setCustomSharedBy("");
    setCustomDepartment("");
    setSelectedUploadFiles([]);
    setUploadDialogOpen(true);
  };

  const handleSave = () => {
    if (formData.type === "link" && !formData.url.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid link URL.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type !== "link" && !formData.name.trim() && selectedUploadFiles.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload a file or enter a file name.",
        variant: "destructive",
      });
      return;
    }

    const resolvedFolder = formData.folder === CUSTOM_FOLDER_VALUE ? customFolder.trim() : formData.folder;
    const resolvedSharedBy = formData.uploadedBy === CUSTOM_SHARED_BY_VALUE ? customSharedBy.trim() : formData.uploadedBy;
    const resolvedDepartment =
      formData.department === CUSTOM_DEPARTMENT_VALUE
        ? customDepartment.trim()
        : formData.department;

    if (!resolvedFolder) {
      toast({
        title: "Validation Error",
        description: "Please provide a folder value.",
        variant: "destructive",
      });
      return;
    }

    if (!resolvedSharedBy) {
      toast({
        title: "Validation Error",
        description: "Please provide a Shared By value.",
        variant: "destructive",
      });
      return;
    }

    if (!resolvedDepartment) {
      toast({
        title: "Validation Error",
        description: "Please provide a department value.",
        variant: "destructive",
      });
      return;
    }

    const normalizedName = formData.type === "link" ? formData.url.trim() : formData.name.trim();

    if (formData.type !== "link" && selectedUploadFiles.length > 0) {
      const newFiles: SharedFile[] = selectedUploadFiles.map((selected, index) => ({
        ...formData,
        id: `FILE-${String(files.length + index + 1).padStart(3, "0")}`,
        name: selected.name,
        type: resolveTypeFromFile(selected),
        size: formatFileSize(selected.size),
        url: URL.createObjectURL(selected),
        folder: resolvedFolder,
        uploadedBy: resolvedSharedBy,
        department: resolvedDepartment,
        downloads: 0,
      }));

      setFiles((prev) => [...newFiles, ...prev]);
    } else {
      const newFile: SharedFile = {
        ...formData,
        name: normalizedName,
        url: formData.type === "link" ? formData.url.trim() : formData.url || "#",
        size: formData.type === "link" ? "-" : formData.size,
        folder: resolvedFolder,
        uploadedBy: resolvedSharedBy,
        department: resolvedDepartment,
        id: `FILE-${String(files.length + 1).padStart(3, "0")}`,
        downloads: 0,
      };
      setFiles((prev) => [newFile, ...prev]);
    }

    if (formData.url.startsWith("blob:")) {
      URL.revokeObjectURL(formData.url);
    }

    setUploadDialogOpen(false);
    toast({
      title: "File Shared",
      description:
        selectedUploadFiles.length > 1
          ? `${selectedUploadFiles.length} files have been shared with the team.`
          : `"${formData.name}" has been shared with the team.`,
    });
  };

  const handleDelete = (file: SharedFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      if (fileToDelete.url.startsWith("blob:")) {
        URL.revokeObjectURL(fileToDelete.url);
      }
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      toast({
        title: "File Removed",
        description: `"${fileToDelete.name}" has been removed.`,
      });
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const getFilteredFiles = () => {
    return files.filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab =
        activeTab === "all" || file.type === activeTab;
      const matchesFolder =
        selectedFolder === "All" || file.folder === selectedFolder;
      return matchesSearch && matchesTab && matchesFolder;
    });
  };

  const typeIcon: Record<string, React.ReactNode> = {
    image: <Image className="h-4 w-4 text-green-600" />,
    pdf: <FileText className="h-4 w-4 text-red-600" />,
    document: <File className="h-4 w-4 text-blue-600" />,
    link: <LinkIcon className="h-4 w-4 text-purple-600" />,
  };

  const typeColors: Record<string, string> = {
    image: "bg-green-50 text-green-700",
    pdf: "bg-red-50 text-red-700",
    document: "bg-blue-50 text-blue-700",
    link: "bg-purple-50 text-purple-700",
  };

  const fileCounts = {
    all: files.length,
    image: files.filter((f) => f.type === "image").length,
    pdf: files.filter((f) => f.type === "pdf").length,
    document: files.filter((f) => f.type === "document").length,
    link: files.filter((f) => f.type === "link").length,
  };

  const filteredFiles = getFilteredFiles();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder === "All" ? "All Folders" : folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 w-9 p-0 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-9 w-9 p-0 rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button onClick={handleUpload} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Share File
        </Button>
      </div>

      {/* File Type Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            All
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {fileCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" />
            Images
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {fileCounts.image}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            Links
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {fileCounts.link}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            PDFs
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {fileCounts.pdf}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-1.5">
            <File className="h-3.5 w-3.5" />
            Documents
            <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">
              {fileCounts.document}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Render content for all tabs */}
        {["all", "image", "link", "pdf", "document"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {viewMode === "list" ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Shared By</TableHead>
                        <TableHead>Folder</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFiles.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-slate-500"
                          >
                            No files found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFiles.map((file) => (
                          <TableRow key={file.id} className="hover:bg-slate-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    typeColors[file.type]?.split(" ")[0] || "bg-slate-50"
                                  }`}
                                >
                                  {typeIcon[file.type]}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate max-w-[250px]">
                                    {file.type === "link"
                                      ? file.description || file.name
                                      : file.name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate max-w-[250px]">
                                    {file.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-xs capitalize ${typeColors[file.type]}`}
                              >
                                {file.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{file.size}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-sm">{file.uploadedBy}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {file.folder}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {new Date(file.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {file.type === "link" ? "—" : file.downloads}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {file.type === "link" ? (
                                    <DropdownMenuItem onClick={() => handleOpenFile(file)}>
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Open Link
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      <DropdownMenuItem onClick={() => handleOpenFile(file)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDownloadFile(file)}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(file)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-500">
                    No files found
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <Card
                      key={file.id}
                      className="group hover:shadow-md transition-all cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div
                          className={`h-20 rounded-lg flex items-center justify-center mb-3 ${
                            typeColors[file.type]?.split(" ")[0] || "bg-slate-50"
                          }`}
                        >
                          <div className="scale-150">{typeIcon[file.type]}</div>
                        </div>
                        <p className="font-medium text-sm truncate" title={file.name}>
                          {file.type === "link" ? file.description || "Link" : file.name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">{file.size}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(file.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 truncate">
                            {file.uploadedBy}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.type === "link" ? (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleOpenFile(file)}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDownloadFile(file)}>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500"
                            onClick={() => handleDelete(file)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Storage Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-xs text-slate-500">
                  {files.length} files shared across {new Set(files.map((f) => f.folder)).size}{" "}
                  folders
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Images: {fileCounts.image}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                Links: {fileCounts.link}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                PDFs: {fileCounts.pdf}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Documents: {fileCounts.document}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload / Share File Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>
              Upload a file or share a link with your team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* File Type */}
            <div className="grid gap-2">
              <Label>File Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "image" | "pdf" | "document" | "link") => {
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                    name: value === "link" ? "" : prev.name,
                    size: value === "link" ? "" : prev.size,
                    url: value === "link" ? "" : prev.url,
                  }));
                  if (value === "link") {
                    setSelectedUploadFiles([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name or URL */}
            {formData.type === "link" ? (
              <div className="grid gap-2">
                <Label htmlFor="fileUrl">Link URL *</Label>
                <Input
                  id="fileUrl"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      url: e.target.value,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="fileName">File Name *</Label>
                  <Input
                    id="fileName"
                    placeholder="e.g., report-q1.pdf"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fileSize">File Size</Label>
                  <Input
                    id="fileSize"
                    placeholder="e.g., 2.4 MB"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, size: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="fileDesc">Description</Label>
              <Input
                id="fileDesc"
                placeholder="Brief description of the file"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            {/* Folder & Shared By */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Folder</Label>
                <Select
                  value={formData.folder}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, folder: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders
                      .filter((f) => f !== "All")
                      .map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))}
                    <SelectItem value={CUSTOM_FOLDER_VALUE}>Custom</SelectItem>
                  </SelectContent>
                </Select>
                {formData.folder === CUSTOM_FOLDER_VALUE && (
                  <Input
                    placeholder="Enter custom folder"
                    value={customFolder}
                    onChange={(e) => setCustomFolder(e.target.value)}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label>Shared By</Label>
                <Select
                  value={formData.uploadedBy}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, uploadedBy: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_SHARED_BY_VALUE}>Custom</SelectItem>
                  </SelectContent>
                </Select>
                {formData.uploadedBy === CUSTOM_SHARED_BY_VALUE && (
                  <Input
                    placeholder="Enter custom shared by"
                    value={customSharedBy}
                    onChange={(e) => setCustomSharedBy(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Department */}
            <div className="grid gap-2">
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_DEPARTMENT_VALUE}>Custom</SelectItem>
                </SelectContent>
              </Select>
              {formData.department === CUSTOM_DEPARTMENT_VALUE && (
                <Input
                  placeholder="Enter custom department"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                />
              )}
            </div>

            {formData.type !== "link" && (
              <div className="grid gap-2">
                <Label>Upload Files / Folder</Label>
                <div
                  role="button"
                  tabIndex={0}
                  onPaste={handlePasteUpload}
                  className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <div className="grid gap-2">
                    <Input
                      id="fileUploadAny"
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                    />
                    <Input
                      id="folderUpload"
                      type="file"
                      multiple
                      onChange={handleFileInputChange}
                      {...({ webkitdirectory: "", directory: "" } as any)}
                    />
                    <p>Choose files or an entire folder. You can also paste an image with Ctrl+V.</p>
                    {selectedUploadFiles.length > 0 && (
                      <p className="text-slate-500">
                        Selected: {selectedUploadFiles.length} item(s), total {formData.size}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Upload className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Remove File
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{fileToDelete?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Keep File
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
