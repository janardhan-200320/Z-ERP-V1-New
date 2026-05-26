type ApiResult<T> = { data?: T; error?: string };

export interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  order?: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  module: string;
  status: string;
  bannerImage?: string | null;
  fields: FormField[];
  responseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPageSection {
  id: string;
  type: "hero" | "text" | "features" | "cta" | "form" | "image" | "testimonials" | "faq" | "custom-html";
  content: Record<string, any>;
  order: number;
}

export interface LandingPageContent {
  sections: LandingPageSection[];
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  status: string;
  formId?: string;
  pageContent: LandingPageContent;
  customCss?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentName?: string;
  respondentEmail?: string;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface FormResponsesResult {
  formTitle: string;
  total: number;
  fields: FormField[];
  responses: FormResponse[];
}

export interface PublicLandingPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  customCss?: string;
  metaTitle?: string;
  metaDescription?: string;
  pageContent: LandingPageContent;
  form?: {
    id: string;
    title: string;
    fields: FormField[];
  } | null;
}

const FORMS_KEY = "crm_form_builder_forms";
const RESPONSES_KEY = "crm_form_builder_responses";
const LANDING_PAGES_KEY = "crm_form_builder_landing_pages";

const nowIso = () => new Date().toISOString();
const genId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function readForms(): Form[] {
  return readJson<Form[]>(FORMS_KEY, []);
}

function writeForms(forms: Form[]): void {
  writeJson(FORMS_KEY, forms);
}

function readResponses(): FormResponse[] {
  return readJson<FormResponse[]>(RESPONSES_KEY, []);
}

function writeResponses(responses: FormResponse[]): void {
  writeJson(RESPONSES_KEY, responses);
}

function readLandingPages(): LandingPage[] {
  return readJson<LandingPage[]>(LANDING_PAGES_KEY, []);
}

function writeLandingPages(pages: LandingPage[]): void {
  writeJson(LANDING_PAGES_KEY, pages);
}

function withCounts(forms: Form[]): Form[] {
  const responses = readResponses();
  const counts = new Map<string, number>();
  for (const r of responses) {
    counts.set(r.formId, (counts.get(r.formId) || 0) + 1);
  }
  return forms.map((f) => ({ ...f, responseCount: counts.get(f.id) || 0 }));
}

function mapFieldsWithIds(nextFields: FormField[], existingFields: FormField[] = []): FormField[] {
  return (nextFields || []).map((field, idx) => ({
    ...field,
    id: field.id || existingFields[idx]?.id || genId("fld"),
    order: idx,
  }));
}

export async function getForms(module?: string): Promise<ApiResult<Form[]>> {
  const forms = withCounts(readForms())
    .filter((f) => (!module ? true : f.module === module))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { data: forms };
}

export async function createForm(payload: {
  title: string;
  description?: string;
  module?: string;
}): Promise<ApiResult<Form>> {
  if (!payload.title?.trim()) return { error: "Title is required" };
  const forms = readForms();
  const item: Form = {
    id: genId("frm"),
    title: payload.title.trim(),
    description: payload.description?.trim() || undefined,
    module: payload.module || "crm",
    status: "active",
    fields: [],
    bannerImage: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  forms.unshift(item);
  writeForms(forms);
  return { data: item };
}

export async function deleteForm(id: string): Promise<ApiResult<true>> {
  const forms = readForms().filter((f) => f.id !== id);
  writeForms(forms);
  const responses = readResponses().filter((r) => r.formId !== id);
  writeResponses(responses);
  return { data: true };
}

export async function getFormPublicUrl(id: string): Promise<ApiResult<{ publicUrl: string }>> {
  return { data: { publicUrl: `${window.location.origin}/form/fill/${id}` } };
}

export async function getForm(id: string): Promise<ApiResult<Form>> {
  const form = withCounts(readForms()).find((f) => f.id === id);
  if (!form) return { error: "Form not found" };
  return { data: form };
}

export async function updateForm(
  id: string,
  payload: Partial<Omit<Form, "id" | "createdAt">>
): Promise<ApiResult<Form>> {
  const forms = readForms();
  const idx = forms.findIndex((f) => f.id === id);
  if (idx === -1) return { error: "Form not found" };

  const prev = forms[idx];
  const next: Form = {
    ...prev,
    ...payload,
    fields: payload.fields ? mapFieldsWithIds(payload.fields as FormField[], prev.fields) : prev.fields,
    updatedAt: nowIso(),
  };

  forms[idx] = next;
  writeForms(forms);
  return { data: next };
}

export async function getFormResponses(formId: string): Promise<ApiResult<FormResponsesResult>> {
  const form = readForms().find((f) => f.id === formId);
  if (!form) return { error: "Form not found" };
  const responses = readResponses()
    .filter((r) => r.formId === formId)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return {
    data: {
      formTitle: form.title,
      total: responses.length,
      fields: form.fields,
      responses,
    },
  };
}

export async function getPublicForm(id: string): Promise<ApiResult<{ id: string; title: string; description?: string; bannerImage?: string | null; fields: FormField[] }>> {
  const form = readForms().find((f) => f.id === id);
  if (!form) return { error: "Form not found" };
  if (form.status !== "active") return { error: "Form is not active" };
  return {
    data: {
      id: form.id,
      title: form.title,
      description: form.description,
      bannerImage: form.bannerImage || null,
      fields: form.fields,
    },
  };
}

export async function submitPublicForm(
  formId: string,
  payload: {
    respondentName?: string;
    respondentEmail?: string;
    answers: Record<string, string>;
  }
): Promise<ApiResult<true>> {
  const form = readForms().find((f) => f.id === formId);
  if (!form) return { error: "Form not found" };
  if (form.status !== "active") return { error: "Form is not active" };

  const responses = readResponses();
  responses.unshift({
    id: genId("rsp"),
    formId,
    respondentName: payload.respondentName,
    respondentEmail: payload.respondentEmail,
    answers: payload.answers || {},
    submittedAt: nowIso(),
  });
  writeResponses(responses);
  return { data: true };
}

export async function getLandingPages(): Promise<ApiResult<LandingPage[]>> {
  const pages = readLandingPages().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { data: pages };
}

export async function createLandingPage(payload: {
  title: string;
  description?: string;
}): Promise<ApiResult<LandingPage>> {
  if (!payload.title?.trim()) return { error: "Title is required" };
  const pages = readLandingPages();
  const baseSlug = payload.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "landing-page";

  let slug = baseSlug;
  let counter = 2;
  while (pages.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const page: LandingPage = {
    id: genId("lp"),
    title: payload.title.trim(),
    slug,
    description: payload.description?.trim() || undefined,
    status: "draft",
    pageContent: { sections: [] },
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  pages.unshift(page);
  writeLandingPages(pages);
  return { data: page };
}

export async function deleteLandingPage(id: string): Promise<ApiResult<true>> {
  const pages = readLandingPages().filter((p) => p.id !== id);
  writeLandingPages(pages);
  return { data: true };
}

export async function getLandingPagePublicUrl(id: string): Promise<ApiResult<{ publicUrl: string }>> {
  const page = readLandingPages().find((p) => p.id === id);
  if (!page) return { error: "Landing page not found" };
  return { data: { publicUrl: `${window.location.origin}/lp/${page.slug}` } };
}

export async function getLandingPage(id: string): Promise<ApiResult<LandingPage>> {
  const page = readLandingPages().find((p) => p.id === id);
  if (!page) return { error: "Landing page not found" };
  return { data: page };
}

export async function updateLandingPage(
  id: string,
  payload: Partial<Omit<LandingPage, "id" | "createdAt">>
): Promise<ApiResult<LandingPage>> {
  const pages = readLandingPages();
  const idx = pages.findIndex((p) => p.id === id);
  if (idx === -1) return { error: "Landing page not found" };

  const prev = pages[idx];
  const nextSlug = payload.slug?.trim() || prev.slug;
  const duplicateSlug = pages.some((p) => p.id !== id && p.slug === nextSlug);
  if (duplicateSlug) return { error: "Slug already exists" };

  const next: LandingPage = {
    ...prev,
    ...payload,
    slug: nextSlug,
    updatedAt: nowIso(),
  };

  pages[idx] = next;
  writeLandingPages(pages);
  return { data: next };
}

export async function getPublicLandingPage(slug: string): Promise<ApiResult<PublicLandingPage>> {
  const page = readLandingPages().find((p) => p.slug === slug);
  if (!page) return { error: "Landing page not found" };
  if (page.status !== "published") return { error: "Landing page is not published" };

  let form: PublicLandingPage["form"] = null;
  if (page.formId) {
    const linked = readForms().find((f) => f.id === page.formId && f.status === "active");
    if (linked) {
      form = { id: linked.id, title: linked.title, fields: linked.fields };
    }
  }

  return {
    data: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.description,
      customCss: page.customCss,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      pageContent: page.pageContent || { sections: [] },
      form,
    },
  };
}
