import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Folder, File, Download, Eye, MoreVertical, Search, FolderPlus, Trash2 } from 'lucide-react';

interface ProjectFilesTabProps {
  projectId: string | undefined;
}

export default function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadForm, setUploadForm] = useState({
    folder: '',
    description: ''
  });
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  const folders = [
    { name: 'Design Files', count: 12, size: '145 MB' },
    { name: 'Documentation', count: 8, size: '24 MB' },
    { name: 'Source Code', count: 156, size: '892 MB' },
    { name: 'Assets', count: 45, size: '234 MB' }
  ];

  const files = [
    { name: 'Project_Requirements.pdf', size: '2.4 MB', version: 'v2.0', uploadedBy: 'John Smith', date: '2026-01-10', icon: File },
    { name: 'Design_Mockups.fig', size: '15.8 MB', version: 'v3.5', uploadedBy: 'Alex Wilson', date: '2026-01-15', icon: File },
    { name: 'Technical_Spec.docx', size: '1.2 MB', version: 'v1.0', uploadedBy: 'Sarah Johnson', date: '2026-01-12', icon: File },
    { name: 'Budget_Plan.xlsx', size: '856 KB', version: 'v2.1', uploadedBy: 'John Smith', date: '2026-01-11', icon: File },
    { name: 'API_Documentation.pdf', size: '3.1 MB', version: 'v1.5', uploadedBy: 'Emily Davis', date: '2026-01-14', icon: File },
    { name: 'Brand_Guidelines.pdf', size: '5.6 MB', version: 'v1.0', uploadedBy: 'Alex Wilson', date: '2026-01-13', icon: File }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFiles(files);
      setShowUploadDialog(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setShowUploadDialog(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload.",
        variant: "destructive"
      });
      return;
    }

    const fileNames = Array.from(selectedFiles).map(f => f.name).join(', ');
    toast({
      title: "Files Uploaded",
      description: `${selectedFiles.length} file(s) uploaded successfully: ${fileNames}`,
    });
    setShowUploadDialog(false);
    setSelectedFiles(null);
    setUploadForm({ folder: '', description: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFolderForm = () => {
    const errors: Record<string, string> = {};
    if (!folderForm.name.trim()) errors.name = 'Folder name is required';
    else if (!/^[a-zA-Z0-9_\- ]+$/.test(folderForm.name)) {
      errors.name = 'Folder name can only contain letters, numbers, spaces, hyphens and underscores';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFolder = () => {
    if (!validateFolderForm()) return;
    
    toast({
      title: "Folder Created",
      description: `Folder "${folderForm.name}" has been created successfully.`,
    });
    setShowNewFolderDialog(false);
    setFolderForm({ name: '', description: '' });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        className={`border-dashed border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'} transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-12 text-center">
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
          <h3 className="font-semibold text-slate-900 mb-2">
            {isDragging ? 'Drop files here' : 'Upload Files'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">Drag and drop files here or click to browse</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <div className="flex gap-2 justify-center">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Folders */}
      <Card>
        <CardHeader>
          <CardTitle>Folders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {folders.map((folder, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <Folder className="h-8 w-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-slate-900">{folder.name}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {folder.count} files • {folder.size}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded">
                    <file.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-slate-600">
                      {file.size} • {file.version} • {file.uploadedBy} • {file.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                    {file.version}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              {selectedFiles && selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected for upload`
                : 'Configure upload settings'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files</Label>
                <div className="border rounded-lg p-3 bg-slate-50 max-h-32 overflow-y-auto">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm py-1">
                      <File className="h-4 w-4 text-blue-600" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="upload-folder">Destination Folder</Label>
              <Select value={uploadForm.folder} onValueChange={(value) => setUploadForm({ ...uploadForm, folder: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root Folder</SelectItem>
                  <SelectItem value="design-files">Design Files</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="source-code">Source Code</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-description">Description (optional)</Label>
              <Textarea
                id="upload-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Add a description for these files..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { 
              setShowUploadDialog(false); 
              setSelectedFiles(null);
              setUploadForm({ folder: '', description: '' });
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload Files</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Create a new folder to organize your files.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name *</Label>
              <Input
                id="folder-name"
                value={folderForm.name}
                onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                placeholder="Enter folder name"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-description">Description (optional)</Label>
              <Textarea
                id="folder-description"
                value={folderForm.description}
                onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                placeholder="Add a description for this folder..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { 
              setShowNewFolderDialog(false); 
              setFolderForm({ name: '', description: '' });
              setFormErrors({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
