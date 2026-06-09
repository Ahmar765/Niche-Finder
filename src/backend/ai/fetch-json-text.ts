/**
 * Lightweight AI text generation using native fetch — no SDK classes.
 * Used for niche search where webpack/App Hosting bundles break OpenAI/Gemini constructors.
 */

export type FetchJsonTextParams = {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
};

export type FetchJsonTextResult = {
  text: string;
  provider: 'openai' | 'gemini';
  model: string;
};

function isConfiguredKey(value: string | undefined): value is string {
  return Boolean(value && !value.includes('SECRET') && value.length > 10);
}

async function callOpenAiFetch(params: FetchJsonTextParams): Promise<FetchJsonTextResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o-mini';

  if (!isConfiguredKey(apiKey)) {
    throw new Error('OpenAI API key is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: params.temperature ?? 0.8,
      max_tokens: Math.min(Math.max(params.maxOutputTokens ?? 4096, 256), 4096),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI returned no content.');
  }

  return { text, provider: 'openai', model };
}

async function callGeminiFetch(params: FetchJsonTextParams): Promise<FetchJsonTextResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_DEFAULT_MODEL || 'gemini-2.5-flash';

  if (!isConfiguredKey(apiKey)) {
    throw new Error('Gemini API key is not configured.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: params.systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: params.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.8,
        maxOutputTokens: Math.min(Math.max(params.maxOutputTokens ?? 4096, 1024), 8192),
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini error ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini (${model}) returned no content.`);
  }

  return { text, provider: 'gemini', model };
}

export async function fetchJsonText(params: FetchJsonTextParams): Promise<FetchJsonTextResult> {
  const failures: string[] = [];

  if (isConfiguredKey(process.env.OPENAI_API_KEY)) {
    try {
      return await callOpenAiFetch(params);
    } catch (error: unknown) {
      failures.push(`openai: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (isConfiguredKey(process.env.GEMINI_API_KEY)) {
    try {
      return await callGeminiFetch(params);
    } catch (error: unknown) {
      failures.push(`gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`All AI providers failed. ${failures.join(' | ')}`);
  }

  throw new Error('No AI providers are configured. Set OPENAI_API_KEY or GEMINI_API_KEY.');
}
