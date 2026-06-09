import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  ArrowLeft,
  Loader2,
  Eye,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  GripVertical,
  Globe,
  Code,
  Type,
  Image,
  Layout,
  MessageSquare,
  HelpCircle,
  FileText,
  MousePointerClick,
  Sparkles,
  Check,
} from 'lucide-react';
import { getLandingPage, updateLandingPage, getLandingPagePublicUrl, getForms } from '@/lib/api';
import type { LandingPageSection, LandingPageContent, Form } from '@/lib/api';
import { useLocation, useRoute } from 'wouter';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section', icon: Sparkles, desc: 'Large heading with subtitle and CTA' },
  { value: 'text', label: 'Text Block', icon: Type, desc: 'Rich text content section' },
  { value: 'features', label: 'Features Grid', icon: Layout, desc: 'Feature cards in a grid' },
  { value: 'cta', label: 'Call to Action', icon: MousePointerClick, desc: 'Prominent action button' },
  { value: 'form', label: 'Embedded Form', icon: FileText, desc: 'Embed a linked CRM form' },
  { value: 'image', label: 'Image Section', icon: Image, desc: 'Full-width or contained image' },
  { value: 'testimonials', label: 'Testimonials', icon: MessageSquare, desc: 'Customer testimonial cards' },
  { value: 'faq', label: 'FAQ Section', icon: HelpCircle, desc: 'Frequently asked questions' },
  { value: 'custom-html', label: 'Custom HTML', icon: Code, desc: 'Raw HTML content block' },
] as const;

function generateId() {
  return `sec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function getDefaultContent(type: string): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        heading: 'Welcome to Our Platform',
        subheading: 'Discover how we can help you grow your business',
        buttonText: 'Get Started',
        buttonLink: '#contact',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff',
      };
    case 'text':
      return {
        heading: 'About Us',
        body: 'Write your content here. You can describe your services, team, or anything relevant to your visitors.',
        alignment: 'center',
      };
    case 'features':
      return {
        heading: 'Our Features',
        features: [
          { title: 'Fast & Reliable', description: 'Lightning-fast performance you can count on', icon: '⚡' },
          { title: 'Secure', description: 'Enterprise-grade security for your data', icon: '🔒' },
          { title: 'Scalable', description: 'Grows with your business needs', icon: '📈' },
        ],
      };
    case 'cta':
      return {
        heading: 'Ready to Get Started?',
        subheading: 'Join thousands of satisfied customers today',
        buttonText: 'Contact Us',
        buttonLink: '#contact',
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
      };
    case 'form':
      return {
        heading: 'Get in Touch',
        subheading: 'Fill out the form below and we\'ll get back to you',
      };
    case 'image':
      return {
        imageUrl: '',
        altText: 'Image description',
        caption: '',
        fullWidth: true,
      };
    case 'testimonials':
      return {
        heading: 'What Our Clients Say',
        testimonials: [
          { name: 'John Doe', role: 'CEO, TechCorp', quote: 'Excellent service and outstanding results!', avatar: '' },
          { name: 'Jane Smith', role: 'Marketing Director', quote: 'Transformed our lead generation completely.', avatar: '' },
        ],
      };
    case 'faq':
      return {
        heading: 'Frequently Asked Questions',
        items: [
          { question: 'What services do you offer?', answer: 'We offer a complete suite of CRM and lead management tools.' },
          { question: 'How do I get started?', answer: 'Simply fill out our contact form and our team will reach out.' },
        ],
      };
    case 'custom-html':
      return {
        html: '<div style="padding: 2rem; text-align: center;">\n  <h3>Custom Section</h3>\n  <p>Add your own HTML here</p>\n</div>',
      };
    default:
      return {};
  }
}

export default function LandingPageEditor() {
  const [, params] = useRoute('/landing-pages/:id/editor');
  const pageId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('draft');
  const [formId, setFormId] = useState<string>('');
  const [customCss, setCustomCss] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [activePanel, setActivePanel] = useState<'sections' | 'css' | 'settings'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    const { data, error } = await getLandingPage(pageId);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
      navigate('/form-builder');
      return;
    }
    if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setDescription(data.description || '');
      setStatus(data.status);
      setFormId(data.formId || '');
      setCustomCss(data.customCss || '');
      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
      setSections(data.pageContent?.sections || []);
    }
    setLoading(false);
  }, [pageId, toast, navigate]);

  const fetchForms = useCallback(async () => {
    const { data } = await getForms('crm');
    if (data) setAvailableForms(data);
  }, []);

  useEffect(() => {
    fetchPage();
    fetchForms();
  }, [fetchPage, fetchForms]);

  const handleSave = async () => {
    if (!pageId || !title.trim()) {
      toast({ title: 'Error', description: 'Page title is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await updateLandingPage(pageId, {
      title: title.trim(),
      slug,
      description: description.trim() || undefined,
      formId: formId || undefined,
      pageContent: { sections },
      customCss,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      status,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Landing page updated successfully' });
    }
  };

  const addSection = (type: string) => {
    const newSection: LandingPageSection = {
      id: generateId(),
      type: type as LandingPageSection['type'],
      content: getDefaultContent(type),
      order: sections.length,
    };
    setSections(prev => [...prev, newSection]);
    setAddSectionOpen(false);
    setEditingSectionId(newSection.id);
  };

  const updateSectionContent = (sectionId: string, content: Record<string, any>) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
  };

  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (editingSectionId === sectionId) setEditingSectionId(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setSections(prev => {
      const arr = [...prev];
      const swapIdx = direction === 'up' ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= arr.length) return prev;
      [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
      return arr.map((s, i) => ({ ...s, order: i }));
    });
  };

  const buildPreviewHtml = () => {
    const formHtml = formId
      ? `<div id="form-section" style="max-width:600px;margin:2rem auto;padding:2rem;background:#f9fafb;border-radius:12px;">
           <p style="text-align:center;color:#6b7280;">Form will be embedded here when published</p>
         </div>`
      : '';

    const sectionsHtml = sections.map(section => {
      const c = section.content;
      switch (section.type) {
        case 'hero':
          return `<section style="padding:4rem 2rem;text-align:center;background:${c.backgroundGradient || '#4f46e5'};color:${c.textColor || '#fff'};">
            <h1 style="font-size:2.5rem;font-weight:800;margin-bottom:1rem;">${escapeHtml(c.heading || '')}</h1>
            <p style="font-size:1.25rem;opacity:0.9;margin-bottom:2rem;">${escapeHtml(c.subheading || '')}</p>
            ${c.buttonText ? `<a href="${escapeHtml(c.buttonLink || '#')}" style="display:inline-block;padding:0.75rem 2rem;background:#fff;color:#4f46e5;border-radius:8px;font-weight:600;text-decoration:none;">${escapeHtml(c.buttonText)}</a>` : ''}
          </section>`;
        case 'text':
          return `<section style="padding:3rem 2rem;max-width:800px;margin:0 auto;text-align:${c.alignment || 'center'};">
            ${c.heading ? `<h2 style="font-size:2rem;font-weight:700;margin-bottom:1rem;">${escapeHtml(c.heading)}</h2>` : ''}
            <p style="font-size:1.1rem;line-height:1.8;color:#4b5563;">${escapeHtml(c.body || '')}</p>
          </section>`;
        case 'features':
          return `<section style="padding:3rem 2rem;max-width:1000px;margin:0 auto;">
            ${c.heading ? `<h2 style="font-size:2rem;font-weight:700;text-align:center;margin-bottom:2rem;">${escapeHtml(c.heading)}</h2>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;">
              ${(c.features || []).map((f: any) => `<div style="padding:1.5rem;border:1px solid #e5e7eb;border-radius:12px;text-align:center;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">${f.icon || '⭐'}</div>
                <h3 style="font-weight:600;margin-bottom:0.5rem;">${escapeHtml(f.title || '')}</h3>
                <p style="color:#6b7280;font-size:0.9rem;">${escapeHtml(f.description || '')}</p>
              </div>`).join('')}
            </div>
          </section>`;
        case 'cta':
          return `<section style="padding:3rem 2rem;text-align:center;background:${c.backgroundColor || '#4f46e5'};color:${c.textColor || '#fff'};border-radius:12px;margin:2rem;">
            <h2 style="font-size:1.75rem;font-weight:700;margin-bottom:0.5rem;">${escapeHtml(c.heading || '')}</h2>
            <p style="opacity:0.9;margin-bottom:1.5rem;">${escapeHtml(c.subheading || '')}</p>
            ${c.buttonText ? `<a href="${escapeHtml(c.buttonLink || '#')}" style="display:inline-block;padding:0.75rem 2rem;background:#fff;color:${c.backgroundColor || '#4f46e5'};border-radius:8px;font-weight:600;text-decoration:none;">${escapeHtml(c.buttonText)}</a>` : ''}
          </section>`;
        case 'form':
          return `<section style="padding:3rem 2rem;text-align:center;max-width:700px;margin:0 auto;">
            ${c.heading ? `<h2 style="font-size:1.75rem;font-weight:700;margin-bottom:0.5rem;">${escapeHtml(c.heading)}</h2>` : ''}
            ${c.subheading ? `<p style="color:#6b7280;margin-bottom:1.5rem;">${escapeHtml(c.subheading)}</p>` : ''}
            ${formHtml || '<p style="color:#9ca3af;">Link a form to display it here</p>'}
          </section>`;
        case 'image':
          return `<section style="padding:2rem;text-align:center;">
            ${c.imageUrl ? `<img src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.altText || '')}" style="max-width:100%;border-radius:12px;${c.fullWidth ? 'width:100%;' : ''}" />` : '<div style="padding:4rem;background:#f3f4f6;border-radius:12px;color:#9ca3af;">Image placeholder</div>'}
            ${c.caption ? `<p style="color:#6b7280;margin-top:0.5rem;font-size:0.9rem;">${escapeHtml(c.caption)}</p>` : ''}
          </section>`;
        case 'testimonials':
          return `<section style="padding:3rem 2rem;max-width:1000px;margin:0 auto;">
            ${c.heading ? `<h2 style="font-size:2rem;font-weight:700;text-align:center;margin-bottom:2rem;">${escapeHtml(c.heading)}</h2>` : ''}
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
              ${(c.testimonials || []).map((t: any) => `<div style="padding:1.5rem;border:1px solid #e5e7eb;border-radius:12px;">
                <p style="font-style:italic;color:#4b5563;margin-bottom:1rem;">"${escapeHtml(t.quote || '')}"</p>
                <p style="font-weight:600;">${escapeHtml(t.name || '')}</p>
                <p style="color:#9ca3af;font-size:0.85rem;">${escapeHtml(t.role || '')}</p>
              </div>`).join('')}
            </div>
          </section>`;
        case 'faq':
          return `<section style="padding:3rem 2rem;max-width:800px;margin:0 auto;">
            ${c.heading ? `<h2 style="font-size:2rem;font-weight:700;text-align:center;margin-bottom:2rem;">${escapeHtml(c.heading)}</h2>` : ''}
            ${(c.items || []).map((item: any) => `<div style="border-bottom:1px solid #e5e7eb;padding:1rem 0;">
              <h3 style="font-weight:600;margin-bottom:0.5rem;">${escapeHtml(item.question || '')}</h3>
              <p style="color:#6b7280;">${escapeHtml(item.answer || '')}</p>
            </div>`).join('')}
          </section>`;
        case 'custom-html':
          return c.html || '';
        default:
          return '';
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;line-height:1.6;}
a{color:inherit;}
img{max-width:100%;height:auto;}
${customCss}
</style>
</head><body>
${sectionsHtml}
</body></html>`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  const editingSection = sections.find(s => s.id === editingSectionId);

  return (
    <DashboardLayout>
      <div className="p-4 max-w-full mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/form-builder')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-bold text-gray-900">Landing Page Editor</h1>
            <Badge variant={status === 'published' ? 'default' : 'secondary'}
              className={status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={async () => {
              if (!pageId) return;
              const { data, error } = await getLandingPagePublicUrl(pageId);
              if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
              else if (data) {
                await navigator.clipboard.writeText(data.publicUrl);
                toast({ title: 'Copied!', description: 'Public URL copied' });
              }
            }}>
              <Copy className="h-4 w-4 mr-1" /> Copy URL
            </Button>
            {status === 'published' && (
              <Button variant="outline" size="sm" onClick={async () => {
                if (!pageId) return;
                // Auto-save before opening live page to ensure latest changes are persisted
                await handleSave();
                const { data, error } = await getLandingPagePublicUrl(pageId);
                if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
                else if (data) window.open(data.publicUrl, '_blank');
              }}>
                <ExternalLink className="h-4 w-4 mr-1" /> View Live
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              <Eye className="h-4 w-4 mr-1" /> {preview ? 'Editor' : 'Preview'}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>

        {preview ? (
          /* ─── Preview Mode ─── */
          <Card className="overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-500 font-mono border">
                  /lp/{slug}
                </div>
              </div>
            </div>
            <iframe
              ref={previewRef}
              srcDoc={buildPreviewHtml()}
              className="w-full border-0"
              style={{ height: '70vh' }}
              title="Landing Page Preview"
              sandbox="allow-same-origin"
            />
          </Card>
        ) : (
          /* ─── Editor Mode ─── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Panel: Section list + controls */}
            <div className="lg:col-span-4 space-y-4">
              {/* Panel Tabs */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setActivePanel('sections')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md ${activePanel === 'sections' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600'}`}>
                  Sections
                </button>
                <button onClick={() => setActivePanel('css')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md ${activePanel === 'css' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600'}`}>
                  CSS
                </button>
                <button onClick={() => setActivePanel('settings')}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md ${activePanel === 'settings' ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-600'}`}>
                  Settings
                </button>
              </div>

              {activePanel === 'sections' && (
                <div className="space-y-3">
                  <Button onClick={() => setAddSectionOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Section
                  </Button>

                  {sections.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Layout className="h-10 w-10 mb-2" />
                        <p className="font-medium">No sections yet</p>
                        <p className="text-sm">Add sections to build your page</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-2 pr-2">
                        {sections.map((section, index) => {
                          const typeInfo = SECTION_TYPES.find(t => t.value === section.type);
                          const Icon = typeInfo?.icon || Layout;
                          const isEditing = editingSectionId === section.id;
                          return (
                            <div
                              key={section.id}
                              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isEditing ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              onClick={() => setEditingSectionId(isEditing ? null : section.id)}
                            >
                              <div className="flex flex-col gap-0.5">
                                <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                                  disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                  <GripVertical className="h-3 w-3 rotate-180" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                                  disabled={index === sections.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                  <GripVertical className="h-3 w-3" />
                                </button>
                              </div>
                              <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{typeInfo?.label || section.type}</p>
                                <p className="text-xs text-gray-500 truncate">{section.content?.heading || section.content?.html?.substring(0, 30) || 'Section ' + (index + 1)}</p>
                              </div>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 shrink-0"
                                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              {activePanel === 'css' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="h-4 w-4" /> Custom CSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={customCss}
                      onChange={(e) => setCustomCss(e.target.value)}
                      placeholder={`/* Custom CSS */\nsection { padding: 2rem; }\n.hero { background: #000; }`}
                      className="font-mono text-sm min-h-[400px] resize-y"
                      spellCheck={false}
                    />
                    <p className="text-xs text-gray-500 mt-2">CSS will be injected into the page's &lt;style&gt; tag.</p>
                  </CardContent>
                </Card>
              )}

              {activePanel === 'settings' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Page Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="page-url-slug"
                        className="font-mono text-sm" />
                      <p className="text-xs text-gray-500 mt-1">Public URL: /lp/{slug}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="Page description..." rows={2} />
                    </div>
                    <div>
                      <Label>Linked Form</Label>
                      <Select value={formId || 'none'} onValueChange={(v) => setFormId(v === 'none' ? '' : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a form to embed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {availableForms.map(f => (
                            <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div>
                      <Label>Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">SEO</p>
                    <div>
                      <Label>Meta Title</Label>
                      <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" />
                    </div>
                    <div>
                      <Label>Meta Description</Label>
                      <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="SEO description..." rows={2} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel: Section editor */}
            <div className="lg:col-span-8">
              {editingSection ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {(() => {
                          const Icon = SECTION_TYPES.find(t => t.value === editingSection.type)?.icon || Layout;
                          return <Icon className="h-4 w-4 text-indigo-500" />;
                        })()}
                        Edit: {SECTION_TYPES.find(t => t.value === editingSection.type)?.label || editingSection.type}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingSectionId(null)}>Done</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionEditor
                      section={editingSection}
                      onUpdate={(content) => updateSectionContent(editingSection.id, content)}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Eye className="h-10 w-10 mb-3" />
                    <p className="font-medium">Select a section to edit</p>
                    <p className="text-sm">Click on a section from the left panel, or add a new one</p>
                  </CardContent>
                </Card>
              )}

              {/* Mini Preview */}
              <Card className="mt-4 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <iframe
                    srcDoc={buildPreviewHtml()}
                    className="w-full border-0 rounded-b-lg"
                    style={{ height: '400px' }}
                    title="Mini Preview"
                    sandbox="allow-same-origin"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Add Section Dialog */}
        <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription>Choose a section type to add to your landing page.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
              {SECTION_TYPES.map((st) => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.value}
                    onClick={() => addSection(st.value)}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-left hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{st.label}</p>
                      <p className="text-xs text-gray-500">{st.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Per-section content editor */
function SectionEditor({ section, onUpdate }: { section: LandingPageSection; onUpdate: (content: Record<string, any>) => void }) {
  const c = section.content;

  const set = (key: string, value: any) => {
    onUpdate({ ...c, [key]: value });
  };

  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div><Label>Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <div><Label>Subheading</Label><Input value={c.subheading || ''} onChange={e => set('subheading', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Button Text</Label><Input value={c.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></div>
            <div><Label>Button Link</Label><Input value={c.buttonLink || ''} onChange={e => set('buttonLink', e.target.value)} /></div>
          </div>
          <div><Label>Background (CSS gradient or color)</Label><Input value={c.backgroundGradient || ''} onChange={e => set('backgroundGradient', e.target.value)} placeholder="linear-gradient(135deg, #667eea, #764ba2)" /></div>
          <div><Label>Text Color</Label><Input value={c.textColor || '#ffffff'} onChange={e => set('textColor', e.target.value)} type="color" className="w-20 h-10" /></div>
        </div>
      );
    case 'text':
      return (
        <div className="space-y-4">
          <div><Label>Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <div><Label>Body</Label><Textarea value={c.body || ''} onChange={e => set('body', e.target.value)} rows={6} /></div>
          <div>
            <Label>Alignment</Label>
            <Select value={c.alignment || 'center'} onValueChange={v => set('alignment', v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    case 'features':
      return (
        <div className="space-y-4">
          <div><Label>Section Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <Label>Features</Label>
          {(c.features || []).map((f: any, i: number) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={f.icon || ''} onChange={e => {
                  const features = [...(c.features || [])];
                  features[i] = { ...features[i], icon: e.target.value };
                  set('features', features);
                }} placeholder="Icon emoji" className="w-16" />
                <Input value={f.title || ''} onChange={e => {
                  const features = [...(c.features || [])];
                  features[i] = { ...features[i], title: e.target.value };
                  set('features', features);
                }} placeholder="Title" className="flex-1" />
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => {
                  set('features', (c.features || []).filter((_: any, idx: number) => idx !== i));
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              <Input value={f.description || ''} onChange={e => {
                const features = [...(c.features || [])];
                features[i] = { ...features[i], description: e.target.value };
                set('features', features);
              }} placeholder="Description" />
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            set('features', [...(c.features || []), { title: 'New Feature', description: '', icon: '⭐' }]);
          }}><Plus className="h-3 w-3 mr-1" /> Add Feature</Button>
        </div>
      );
    case 'cta':
      return (
        <div className="space-y-4">
          <div><Label>Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <div><Label>Subheading</Label><Input value={c.subheading || ''} onChange={e => set('subheading', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Button Text</Label><Input value={c.buttonText || ''} onChange={e => set('buttonText', e.target.value)} /></div>
            <div><Label>Button Link</Label><Input value={c.buttonLink || ''} onChange={e => set('buttonLink', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Background Color</Label><Input value={c.backgroundColor || '#4f46e5'} onChange={e => set('backgroundColor', e.target.value)} type="color" className="w-20 h-10" /></div>
            <div><Label>Text Color</Label><Input value={c.textColor || '#ffffff'} onChange={e => set('textColor', e.target.value)} type="color" className="w-20 h-10" /></div>
          </div>
        </div>
      );
    case 'form':
      return (
        <div className="space-y-4">
          <div><Label>Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <div><Label>Subheading</Label><Input value={c.subheading || ''} onChange={e => set('subheading', e.target.value)} /></div>
          <p className="text-sm text-gray-500">The linked form (set in Settings tab) will render in this section on the live page.</p>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-4">
          <div><Label>Image URL</Label><Input value={c.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." /></div>
          <div><Label>Alt Text</Label><Input value={c.altText || ''} onChange={e => set('altText', e.target.value)} /></div>
          <div><Label>Caption</Label><Input value={c.caption || ''} onChange={e => set('caption', e.target.value)} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={c.fullWidth || false} onCheckedChange={v => set('fullWidth', v)} />
            <Label>Full Width</Label>
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div className="space-y-4">
          <div><Label>Section Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <Label>Testimonials</Label>
          {(c.testimonials || []).map((t: any, i: number) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={t.name || ''} onChange={e => {
                  const testimonials = [...(c.testimonials || [])];
                  testimonials[i] = { ...testimonials[i], name: e.target.value };
                  set('testimonials', testimonials);
                }} placeholder="Name" className="flex-1" />
                <Input value={t.role || ''} onChange={e => {
                  const testimonials = [...(c.testimonials || [])];
                  testimonials[i] = { ...testimonials[i], role: e.target.value };
                  set('testimonials', testimonials);
                }} placeholder="Role" className="flex-1" />
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => {
                  set('testimonials', (c.testimonials || []).filter((_: any, idx: number) => idx !== i));
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              <Textarea value={t.quote || ''} onChange={e => {
                const testimonials = [...(c.testimonials || [])];
                testimonials[i] = { ...testimonials[i], quote: e.target.value };
                set('testimonials', testimonials);
              }} placeholder="Quote" rows={2} />
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            set('testimonials', [...(c.testimonials || []), { name: '', role: '', quote: '' }]);
          }}><Plus className="h-3 w-3 mr-1" /> Add Testimonial</Button>
        </div>
      );
    case 'faq':
      return (
        <div className="space-y-4">
          <div><Label>Section Heading</Label><Input value={c.heading || ''} onChange={e => set('heading', e.target.value)} /></div>
          <Label>FAQ Items</Label>
          {(c.items || []).map((item: any, i: number) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={item.question || ''} onChange={e => {
                  const items = [...(c.items || [])];
                  items[i] = { ...items[i], question: e.target.value };
                  set('items', items);
                }} placeholder="Question" className="flex-1" />
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => {
                  set('items', (c.items || []).filter((_: any, idx: number) => idx !== i));
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
              <Textarea value={item.answer || ''} onChange={e => {
                const items = [...(c.items || [])];
                items[i] = { ...items[i], answer: e.target.value };
                set('items', items);
              }} placeholder="Answer" rows={2} />
            </Card>
          ))}
          <Button variant="outline" size="sm" onClick={() => {
            set('items', [...(c.items || []), { question: '', answer: '' }]);
          }}><Plus className="h-3 w-3 mr-1" /> Add FAQ</Button>
        </div>
      );
    case 'custom-html':
      return (
        <div className="space-y-4">
          <div>
            <Label>HTML Content</Label>
            <Textarea
              value={c.html || ''}
              onChange={e => set('html', e.target.value)}
              placeholder="<div>Your HTML here</div>"
              className="font-mono text-sm min-h-[300px] resize-y"
              spellCheck={false}
            />
          </div>
          <p className="text-xs text-gray-500">This HTML will be rendered directly on the page. Use responsibly.</p>
        </div>
      );
    default:
      return <p className="text-gray-500">No editor available for this section type.</p>;
  }
}
