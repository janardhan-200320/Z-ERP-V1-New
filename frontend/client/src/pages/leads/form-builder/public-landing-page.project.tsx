import { useState, useEffect, useCallback } from 'react';
import { useRoute } from 'wouter';
import { getPublicLandingPage, submitPublicForm } from '@/lib/form-builder-api';
import type { PublicLandingPage, FormField } from '@/lib/form-builder-api';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export default function PublicLandingPageView() {
  const [, params] = useRoute('/lp/:slug');
  const slug = params?.slug || '';

  const [page, setPage] = useState<PublicLandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchPage = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    const { data, error: err } = await getPublicLandingPage(slug);
    if (err) setError(err);
    else if (data) setPage(data);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    if (page?.metaTitle) document.title = page.metaTitle;
    else if (page?.title) document.title = page.title;
  }, [page]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page?.form) return;

    for (const field of page.form.fields) {
      if (field.required && field.id) {
        const val = answers[field.id];
        if (!val || val.trim() === '') {
          setSubmitError(`"${field.label}" is required`);
          return;
        }
      }
    }

    setSubmitting(true);
    setSubmitError('');
    const { error: err } = await submitPublicForm(page.form.id, {
      respondentName: respondentName.trim() || undefined,
      respondentEmail: respondentEmail.trim() || undefined,
      answers,
    });
    setSubmitting(false);
    if (err) setSubmitError(err);
    else setSubmitted(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div style={styles.errorContainer}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Page Not Found</h1>
        <p style={{ color: '#6b7280' }}>{error || 'This landing page does not exist or is no longer available.'}</p>
      </div>
    );
  }

  return (
    <>
      {page.customCss && <style>{page.customCss}</style>}
      {page.metaDescription && (
        <meta name="description" content={page.metaDescription} />
      )}
      <div className="landing-page" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', lineHeight: 1.6 }}>
        {page.pageContent.sections.map((section, index) => (
          <SectionRenderer
            key={section.id || index}
            section={section}
            form={page.form}
            formState={{
              answers, respondentName, respondentEmail,
              submitting, submitted, submitError,
              setAnswers, setRespondentName, setRespondentEmail,
              handleFormSubmit,
            }}
          />
        ))}
      </div>
    </>
  );
}

interface FormState {
  answers: Record<string, string>;
  respondentName: string;
  respondentEmail: string;
  submitting: boolean;
  submitted: boolean;
  submitError: string;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setRespondentName: (v: string) => void;
  setRespondentEmail: (v: string) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
}

function SectionRenderer({
  section,
  form,
  formState,
}: {
  section: { id: string; type: string; content: Record<string, any> };
  form?: { id: string; title: string; fields: FormField[] } | null;
  formState: FormState;
}) {
  const c = section.content;

  switch (section.type) {
    case 'hero':
      return (
        <section style={{
          padding: '5rem 2rem', textAlign: 'center',
          background: c.backgroundGradient || '#4f46e5',
          color: c.textColor || '#fff',
        }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            {c.heading}
          </h1>
          {c.subheading && (
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
              {c.subheading}
            </p>
          )}
          {c.buttonText && (
            <a href={c.buttonLink || '#'} style={{
              display: 'inline-block', padding: '0.85rem 2.5rem',
              background: '#fff', color: '#4f46e5', borderRadius: 8,
              fontWeight: 600, textDecoration: 'none', fontSize: '1.05rem',
            }}>
              {c.buttonText}
            </a>
          )}
        </section>
      );

    case 'text':
      return (
        <section style={{ padding: '3.5rem 2rem', maxWidth: 800, margin: '0 auto', textAlign: c.alignment || 'center' }}>
          {c.heading && <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{c.heading}</h2>}
          {c.body && <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#4b5563' }}>{c.body}</p>}
        </section>
      );

    case 'features':
      return (
        <section style={{ padding: '3.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
          {c.heading && <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>{c.heading}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {(c.features || []).map((f: any, i: number) => (
              <div key={i} style={{ padding: '1.75rem', border: '1px solid #e5e7eb', borderRadius: 12, textAlign: 'center' }}>
                {f.icon && <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>}
                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      );

    case 'cta':
      return (
        <section style={{
          padding: '3.5rem 2rem', textAlign: 'center',
          background: c.backgroundColor || '#4f46e5', color: c.textColor || '#fff',
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.heading}</h2>
          {c.subheading && <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>{c.subheading}</p>}
          {c.buttonText && (
            <a href={c.buttonLink || '#'} style={{
              display: 'inline-block', padding: '0.75rem 2rem',
              background: '#fff', color: c.backgroundColor || '#4f46e5',
              borderRadius: 8, fontWeight: 600, textDecoration: 'none',
            }}>
              {c.buttonText}
            </a>
          )}
        </section>
      );

    case 'form':
      return (
        <section id="contact" style={{ padding: '3.5rem 2rem', maxWidth: 700, margin: '0 auto' }}>
          {c.heading && <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>{c.heading}</h2>}
          {c.subheading && <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>{c.subheading}</p>}
          {form ? (
            <EmbeddedForm form={form} formState={formState} />
          ) : (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>No form linked</p>
          )}
        </section>
      );

    case 'image':
      return (
        <section style={{ padding: '2rem', textAlign: 'center' }}>
          {c.imageUrl ? (
            <img
              src={c.imageUrl}
              alt={c.altText || ''}
              style={{ maxWidth: '100%', borderRadius: 12, ...(c.fullWidth ? { width: '100%' } : {}) }}
            />
          ) : null}
          {c.caption && <p style={{ color: '#6b7280', marginTop: '0.75rem', fontSize: '0.9rem' }}>{c.caption}</p>}
        </section>
      );

    case 'testimonials':
      return (
        <section style={{ padding: '3.5rem 2rem', maxWidth: 1000, margin: '0 auto' }}>
          {c.heading && <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>{c.heading}</h2>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {(c.testimonials || []).map((t: any, i: number) => (
              <div key={i} style={{ padding: '1.75rem', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fafafa' }}>
                <p style={{ fontStyle: 'italic', color: '#4b5563', marginBottom: '1rem', fontSize: '1rem' }}>"{t.quote}"</p>
                <p style={{ fontWeight: 600 }}>{t.name}</p>
                {t.role && <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{t.role}</p>}
              </div>
            ))}
          </div>
        </section>
      );

    case 'faq':
      return (
        <section style={{ padding: '3.5rem 2rem', maxWidth: 800, margin: '0 auto' }}>
          {c.heading && <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>{c.heading}</h2>}
          {(c.items || []).map((item: any, i: number) => (
            <div key={i} style={{ borderBottom: '1px solid #e5e7eb', padding: '1.25rem 0' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{item.question}</h3>
              <p style={{ color: '#6b7280' }}>{item.answer}</p>
            </div>
          ))}
        </section>
      );

    case 'custom-html':
      return <section dangerouslySetInnerHTML={{ __html: c.html || '' }} />;

    default:
      return null;
  }
}

function EmbeddedForm({ form, formState }: { form: { id: string; title: string; bannerImage?: string | null; fields: FormField[] }; formState: FormState }) {
  const { answers, respondentName, respondentEmail, submitting, submitted, submitError, setAnswers, setRespondentName, setRespondentEmail, handleFormSubmit } = formState;

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#166534' }}>Thank You!</h3>
        <p style={{ color: '#4b5563' }}>Your form has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {form.bannerImage && (
        <img
          src={form.bannerImage}
          alt="Form banner"
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      )}
      <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={styles.label}>Your Name</label>
        <input
          type="text"
          value={respondentName}
          onChange={e => setRespondentName(e.target.value)}
          style={styles.input}
          placeholder="Enter your name"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={styles.label}>Your Email</label>
        <input
          type="email"
          value={respondentEmail}
          onChange={e => setRespondentEmail(e.target.value)}
          style={styles.input}
          placeholder="Enter your email"
        />
      </div>
      {form.fields.map(field => (
        <div key={field.id} style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>
            {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          {(field as any).helpText && <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0' }}>{(field as any).helpText}</p>}
          <FieldInput
            field={field}
            value={answers[field.id || ''] || ''}
            onChange={(val) => {
              if (field.id) setAnswers(prev => ({ ...prev, [field.id!]: val }));
            }}
          />
        </div>
      ))}
      {submitError && (
        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{submitError}</p>
      )}
      <button type="submit" disabled={submitting} style={{
        ...styles.submitButton,
        opacity: submitting ? 0.6 : 1,
        cursor: submitting ? 'not-allowed' : 'pointer',
      }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
      </div>
    </form>
  );
}

function FieldInput({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) {
  const fieldType = field.type || 'text';

  if (fieldType === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        required={field.required}
        rows={4}
        style={{ ...styles.input, minHeight: 100, resize: 'vertical' as const }}
      />
    );
  }

  if (fieldType === 'select' && field.options) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={field.required}
        style={styles.input}
      >
        <option value="">Select an option</option>
        {field.options.map((opt, i) => (
          <option key={i} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (fieldType === 'radio' && field.options) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {field.options.map((opt, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="radio" name={field.id} value={opt} checked={value === opt}
              onChange={() => onChange(opt)} required={field.required && !value} />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (fieldType === 'checkbox') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={value === 'true'}
          onChange={e => onChange(e.target.checked ? 'true' : '')} />
        {field.placeholder || field.label}
      </label>
    );
  }

  return (
    <input
      type={fieldType === 'email' ? 'email' : fieldType === 'url' ? 'url' : fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : fieldType === 'phone' ? 'tel' : 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder || ''}
      required={field.required}
      style={styles.input}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f9fafb',
  },
  spinner: {
    width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#4f46e5',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: '#f9fafb', textAlign: 'center', padding: '2rem',
  },
  label: {
    display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem',
  },
  input: {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit',
    background: '#fff',
  },
  submitButton: {
    width: '100%', padding: '0.75rem', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1rem',
    fontFamily: 'inherit',
  },
};
