export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function parseAiJson<T = Record<string, unknown>>(raw: string): T {
  const jsonText = extractJsonText(raw);

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    throw new Error(
      `AI response was not valid JSON: ${error instanceof Error ? error.message : 'parse failed'}`,
    );
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function normalizeBlogPostAiOutput(raw: unknown): {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
} | null {
  if (!raw || typeof raw !== 'object') return null;

  const root = raw as Record<string, unknown>;
  const nested =
    root.blogPost && typeof root.blogPost === 'object'
      ? (root.blogPost as Record<string, unknown>)
      : root.post && typeof root.post === 'object'
        ? (root.post as Record<string, unknown>)
        : root.article && typeof root.article === 'object'
          ? (root.article as Record<string, unknown>)
          : root;

  const title = pickString(nested.title, nested.seoTitle, nested.headline);
  const content = pickString(nested.content, nested.body, nested.markdown, nested.articleContent);
  if (!title || !content) return null;

  const seoTitle = pickString(nested.seoTitle, nested.metaTitle, nested.title, title) ?? title;
  const seoDescription =
    pickString(
      nested.seoDescription,
      nested.metaDescription,
      nested.description,
      nested.excerpt,
      nested.summary,
    ) ?? title.slice(0, 160);

  const seoKeywords = toStringArray(
    nested.seoKeywords ?? nested.keywords ?? nested.tags ?? nested.semanticKeywords,
  );

  const slug =
    pickString(nested.slug, nested.urlSlug) ??
    slugify(title);

  return {
    title,
    slug,
    content,
    seoTitle,
    seoDescription,
    seoKeywords: seoKeywords.length > 0 ? seoKeywords.slice(0, 8) : [title.split(' ')[0] || 'niche'],
  };
}

export function normalizeSupportChatAiOutput(raw: unknown): {
  response: string;
  escalateToHuman: boolean;
} | null {
  if (!raw || typeof raw !== 'object') return null;

  const root = raw as Record<string, unknown>;
  const text = pickString(root.response, root.reply, root.message, root.answer, root.content);
  if (!text) return null;

  const escalateRaw = root.escalateToHuman ?? root.escalate ?? root.needsHuman;
  const escalateToHuman =
    escalateRaw === true ||
    escalateRaw === 'true' ||
    escalateRaw === 1;

  return { response: text, escalateToHuman };
}

export function normalizeSeoArticleAiOutput(raw: unknown): {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  schema: string;
} | null {
  if (!raw || typeof raw !== 'object') return null;

  const root = raw as Record<string, unknown>;
  const nested =
    root.article && typeof root.article === 'object'
      ? (root.article as Record<string, unknown>)
      : root;

  const title = pickString(nested.title, nested.seoTitle, nested.headline);
  const content = pickString(nested.content, nested.body, nested.markdown, nested.articleContent);
  if (!title || !content) return null;

  const seoTitle = pickString(nested.seoTitle, nested.metaTitle, title) ?? title;
  const metaDescription =
    pickString(nested.metaDescription, nested.seoDescription, nested.description, nested.excerpt) ??
    title.slice(0, 160);
  const keywords = toStringArray(nested.keywords ?? nested.semanticKeywords ?? nested.seoKeywords ?? nested.tags);
  const slug = pickString(nested.slug) ?? slugify(title);

  let schema = '{}';
  if (typeof nested.schema === 'string') {
    schema = nested.schema;
  } else if (typeof nested.schemaJson === 'string') {
    schema = nested.schemaJson;
  } else if (nested.schema && typeof nested.schema === 'object') {
    schema = JSON.stringify(nested.schema);
  }

  return {
    title,
    slug,
    content,
    seoTitle,
    metaDescription,
    keywords: keywords.length > 0 ? keywords : [title.split(' ')[0] || 'seo'],
    schema,
  };
}
