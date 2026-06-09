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

function closeTruncatedJson(text: string): string {
  let s = text.trim();
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const char of s) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBraces += 1;
      else if (char === '}') openBraces -= 1;
      else if (char === '[') openBrackets += 1;
      else if (char === ']') openBrackets -= 1;
    }
  }

  if (inString) s += '"';
  while (openBrackets > 0) {
    s += ']';
    openBrackets -= 1;
  }
  while (openBraces > 0) {
    s += '}';
    openBraces -= 1;
  }

  return s;
}

function repairJsonText(text: string): string {
  let s = text
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  s = s.replace(/\/\/[^\n\r]*/g, '');
  s = s.replace(/\bundefined\b/g, 'null');
  s = s.replace(/,\s*([}\]])/g, '$1');
  s = s.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  s = s.replace(/:\s*'((?:\\'|[^'])*)'/g, (_match, value: string) => {
    const escaped = value.replace(/"/g, '\\"');
    return `: "${escaped}"`;
  });

  return closeTruncatedJson(s);
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function parseAiJson<T = Record<string, unknown>>(raw: string): T {
  const jsonText = extractJsonText(raw);
  const candidates = [jsonText, repairJsonText(jsonText)];

  for (const candidate of candidates) {
    const parsed = tryParseJson<T>(candidate);
    if (parsed !== null) return parsed;
  }

  throw new Error(
    'AI response was not valid JSON. The model returned malformed data — please try again.',
  );
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

export type NormalizedNicheSearchItem = {
  title: string;
  description: string;
  situation: string;
  insight: string;
  sector: string;
  targetCustomer: string;
  businessModel: string;
  revenueLogic: string;
  solution: string;
  scorecard: Record<string, unknown>;
  rawScores: Record<string, unknown>;
  explanation: Record<string, unknown>;
  decisionSupport: Record<string, unknown>;
  breakthroughRationale?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeNicheSearchAiOutput(raw: unknown): NormalizedNicheSearchItem[] {
  if (!raw || typeof raw !== 'object') return [];

  const root = raw as Record<string, unknown>;
  const list = root.results ?? root.niches ?? root.recommendations ?? root.ideas;
  if (!Array.isArray(list)) return [];

  const normalized: NormalizedNicheSearchItem[] = [];

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;

    const item = entry as Record<string, unknown>;
      const niche = asRecord(item.niche);
      const scorecard = asRecord(item.scorecard);
      const explanation = asRecord(item.explanation);
      const decisionSupport = asRecord(item.decisionSupport);
      const scoringExplanation = asRecord(scorecard.scoringExplanation);

      const title =
        pickString(item.title, niche.title, item.name, item.nicheTitle) ?? 'Untitled Opportunity';
      const description =
        pickString(item.description, item.summary, niche.summary, item.situation) ??
        'AI-generated business opportunity.';

      normalized.push({
        title,
        description,
        situation: pickString(item.situation, explanation.situation, description) ?? description,
        insight: pickString(item.insight, explanation.insight, item.whyNow) ?? description,
        sector: pickString(item.sector, niche.sectorSlug, item.sectorSlug) ?? 'Uncategorized',
        targetCustomer:
          pickString(item.targetCustomer, niche.targetAudience, item.audience) ?? 'Undisclosed',
        businessModel:
          pickString(item.businessModel, niche.businessModel) ?? 'Standard',
        revenueLogic:
          pickString(item.revenueLogic, item.revenueModel, niche.revenueModel) ?? 'Standard',
        solution: pickString(item.solution, item.whyNow, description) ?? description,
        scorecard: {
          overallConfidenceScore:
            typeof scorecard.overallConfidenceScore === 'number'
              ? scorecard.overallConfidenceScore
              : 85,
          scoringExplanation: {
            riskWarning:
              pickString(scoringExplanation.riskWarning, item.mainRisk) ??
              'Standard execution risk',
            strongestSignal:
              pickString(scoringExplanation.strongestSignal, item.insight) ?? 'High demand signal',
          },
          breakthroughPotentialScore:
            typeof scorecard.breakthroughPotentialScore === 'number'
              ? scorecard.breakthroughPotentialScore
              : null,
          ...scorecard,
        },
        rawScores: asRecord(item.rawScores),
        explanation,
        decisionSupport,
        breakthroughRationale: pickString(
          explanation.breakthroughRationale,
          item.breakthroughRationale,
        ),
      });
  }

  return normalized;
}
