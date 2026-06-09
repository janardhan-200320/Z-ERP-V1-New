import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ChevronLeft, ChevronRight, Loader2, Maximize2, Minimize2, Search, Trash2, Upload, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import HTMLFlipBook from "react-pageflip";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const FlipBook: any = HTMLFlipBook;

type FlipDoc = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  pages: string[];
  createdAt: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FlipBookLibraryPage() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<FlipDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window === "undefined" ? 1440 : window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState<number>(typeof window === "undefined" ? 900 : window.innerHeight);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const flipRef = useRef<any>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((doc) => `${doc.title} ${doc.description} ${doc.fileName}`.toLowerCase().includes(q));
  }, [documents, query]);

  const activeDoc = useMemo(
    () => documents.find((doc) => doc.id === activeDocId) ?? null,
    [documents, activeDocId],
  );

  const pageWidth = useMemo(() => {
    if (isFullscreen) {
      const usableWidth = Math.max(560, viewportWidth - 220);
      const maxByHeight = Math.floor((Math.max(640, viewportHeight - 180)) / 1.414);
      return Math.max(360, Math.min(700, Math.floor(usableWidth / 2), maxByHeight));
    }
    return 360;
  }, [isFullscreen, viewportHeight, viewportWidth]);

  const pageHeight = useMemo(() => Math.floor(pageWidth * 1.414), [pageWidth]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await getDocument({ data: bytes }).promise;
      const pages: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.35 });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) {
          throw new Error("Unable to render PDF page");
        }

        await page.render({ canvas, canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL("image/jpeg", 0.9));
      }

      const finalTitle = title.trim() || file.name.replace(/\.pdf$/i, "");
      const newDoc: FlipDoc = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: finalTitle,
        description: description.trim(),
        fileName: file.name,
        fileSize: file.size,
        pageCount: pdf.numPages,
        pages,
        createdAt: new Date().toISOString(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      setCurrentPage(1);
      setTitle("");
      setDescription("");
      toast({ title: "PDF uploaded", description: "Flip book is ready." });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Could not process the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteDoc = (docId: string) => {
    setDocuments((prev) => {
      const next = prev.filter((doc) => doc.id !== docId);
      if (activeDocId === docId) {
        setActiveDocId(next[0]?.id ?? null);
        setCurrentPage(1);
      }
      return next;
    });
  };

  const flipPrev = () => {
    flipRef.current?.pageFlip()?.flipPrev();
  };

  const flipNext = () => {
    flipRef.current?.pageFlip()?.flipNext();
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(2, Number((prev + 0.1).toFixed(2))));
  const zoomOut = () => setZoomLevel((prev) => Math.max(0.8, Number((prev - 0.1).toFixed(2))));
  const resetZoom = () => setZoomLevel(1);

  const toggleFullscreen = async () => {
    const target = viewerRef.current;
    if (!target) return;

    if (!document.fullscreenElement) {
      await target.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Flip Book Library</h1>
              <p className="mt-1 text-sm text-slate-500">Upload a PDF and view it with page flip animation.</p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[520px]">
              <Input
                placeholder="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Search documents"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[74px]"
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  className="gap-2 bg-[linear-gradient(135deg,#1C7ED6_0%,#37B24D_100%)] text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isUploading ? "Processing PDF..." : "Upload PDF"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[350px,1fr]">
          <Card className="rounded-3xl border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Documents</h2>
              <Badge variant="secondary">{filteredDocs.length}</Badge>
            </div>

            <div className="max-h-[72vh] space-y-2 overflow-y-auto pr-1">
              {!filteredDocs.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">No documents uploaded yet.</p>
                </div>
              )}

              {filteredDocs.map((doc) => {
                const selected = doc.id === activeDocId;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setActiveDocId(doc.id);
                      setCurrentPage(1);
                    }}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      selected
                        ? "border-blue-300 bg-blue-50/70"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{doc.title}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{doc.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">{doc.pageCount} pages • {formatFileSize(doc.fileSize)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc.id);
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-slate-200 bg-[radial-gradient(ellipse_at_top,#0b1f48_0%,#071735_42%,#06132c_100%)] p-4 text-white sm:p-5">
            {!activeDoc ? (
              <div className="flex min-h-[62vh] flex-col items-center justify-center text-center">
                <div className="rounded-full bg-white/10 p-6">
                  <BookOpen className="h-10 w-10 text-white/70" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold">Select or Upload a Document</h3>
                <p className="mt-2 max-w-md text-sm text-slate-300">Your PDF will be rendered to pages and shown with page-turn controls.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{activeDoc.title}</p>
                      <p className="text-xs text-slate-300">{activeDoc.pageCount} pages</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={flipPrev}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Badge className="bg-white/20 text-white">Page {currentPage} / {activeDoc.pageCount}</Badge>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8"
                        onClick={flipNext}
                        disabled={currentPage >= activeDoc.pageCount}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={zoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" className="h-8 px-2 text-xs" onClick={resetZoom}>
                        {Math.round(zoomLevel * 100)}%
                      </Button>
                      <Button variant="secondary" size="icon" className="h-8 w-8" onClick={zoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        {isFullscreen ? "Exit" : "Full"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div
                  ref={viewerRef}
                  className={`book-stage flex items-center justify-center overflow-auto rounded-2xl border border-white/10 bg-black/25 p-3 ${isFullscreen ? "min-h-screen w-screen rounded-none border-0" : "min-h-[62vh]"}`}
                >
                  <div
                    className={`book-stage__surface ${isFlipping ? "book-stage__surface--flipping" : ""}`}
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                  >
                    <div className="book-spine" aria-hidden="true" />
                    <FlipBook
                      key={`${activeDoc.id}-${activeDoc.pages.length}`}
                      width={pageWidth}
                      height={pageHeight}
                      size="fixed"
                      minWidth={220}
                      maxWidth={Math.max(680, pageWidth + 40)}
                      minHeight={320}
                      maxHeight={Math.max(920, pageHeight + 40)}
                      maxShadowOpacity={0.72}
                      mobileScrollSupport
                      showCover
                      usePortrait={false}
                      drawShadow
                      flippingTime={920}
                      className="magazine-book__engine"
                      ref={flipRef}
                      onChangeState={(e: any) => {
                        const state = String(e?.data || "").toLowerCase();
                        setIsFlipping(state === "flipping");
                      }}
                      onFlip={(e: any) => {
                        setCurrentPage((Number(e?.data) || 0) + 1);
                      }}
                    >
                      {activeDoc.pages.map((src, index) => (
                        <div key={`${activeDoc.id}-${index + 1}`} className="book-sheet">
                          <div className="book-sheet__paper">
                            <div className="book-sheet__edge" aria-hidden="true" />
                            <img
                              src={src}
                              alt={`Page ${index + 1}`}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ))}
                    </FlipBook>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
