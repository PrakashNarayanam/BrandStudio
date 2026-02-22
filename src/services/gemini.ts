import { BrandName, BrandingContent, SentimentResult, ColorPaletteResult, BrandAuditResult } from "../types";
import { trackEvent } from "../utils/analytics";

// ── Groq helpers ──────────────────────────────────────────────────────────────
const GROQ_BASE = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function groqChat(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ""}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "{}";
}

// ── HuggingFace logo generation ───────────────────────────────────────────────
async function hfGenerateImage(prompt: string): Promise<string> {
  const hfApiKey = import.meta.env.VITE_HF_API_KEY || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (hfApiKey && !hfApiKey.startsWith("hf_xxx")) {
    headers["Authorization"] = `Bearer ${hfApiKey}`;
  }

  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
    { method: "POST", headers, body: JSON.stringify({ inputs: prompt }) }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HuggingFace API error (${res.status}): ${err}`);
  }

  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Groq multi-turn chat session ──────────────────────────────────────────────
class GroqChatSession {
  private history: { role: string; content: string }[] = [];
  private systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  async sendMessage({ message }: { message: string }): Promise<{ text: string }> {
    this.history.push({ role: "user", content: message });

    const res = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ""}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: this.systemPrompt }, ...this.history],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";
    this.history.push({ role: "assistant", content: reply });
    trackEvent("chat");
    return { text: reply };
  }
}

// ── Public service ────────────────────────────────────────────────────────────
export const geminiService = {
  async generateBrandNames(industry: string, audience: string, personality: string): Promise<BrandName[]> {
    const text = await groqChat(
      "You are an expert brand strategist and naming consultant. Always respond with valid JSON.",
      `Generate exactly 10 unique, creative, and highly brandable startup names for a ${industry} company targeting ${audience} with a ${personality} personality.

Rules:
- Names must be highly unique and likely to have available .com or .io domains.
- Avoid common words or existing brand clones.
- Mix styles: compound words, coined words, metaphors, acronyms.
- Each name should feel distinct and professional.
- Explain why each name works for this brand specifically.

Return a JSON object with key "names" containing an array of objects, each with "name" (string) and "explanation" (string).`
    );

    const parsed = JSON.parse(text);
    const names = Array.isArray(parsed) ? parsed : (parsed.names || []);
    trackEvent("brand_name", industry);
    return names;
  },

  async suggestNamingContext(): Promise<{ industry: string; audience: string; personality: string }> {
    const text = await groqChat(
      "You are a startup incubator mentor. Always respond with valid JSON.",
      `Suggest a trending industry, a specific target audience, and a fitting brand personality for a new startup.
      
      Personality options: Modern, Luxury, Playful, Minimalist, Bold, Tech-focused.
      
      Return JSON with keys: industry (string), audience (string), personality (string).`
    );

    const result = JSON.parse(text);
    trackEvent("suggest_names");
    return result;
  },

  async generateLogo(brandName: string, style: string, palette: string, features?: string): Promise<string> {
    const colorPart = `using the exact color palette: ${palette}`;

    // Style-specific design directives for sharper differentiation
    const styleDirectives: Record<string, string> = {
      "Minimalist": "ultra-clean negative space, single icon mark using 'S' or 'SB' initials, thin sans-serif wordmark, maximum 2 colors, luxury branding vibe",
      "Corporate": "highly professional corporate branding, trustworthy and established feel, unique geometric symbol incorporating the company initials, balanced visual hierarchy, premium blue and silver tones",
      "Monogram": "expertly crafted monogram logo using first letters 'S' and 'B', interlocking or geometric letterforms, premium corporate identity, sophisticated typography",
      "Futuristic": "sleek metallic gradients, geometric glitch accents, neon glow edges, tech-forward typography using 'SB' emblem, dark background compatible",
      "Bold & Vibrant": "high-contrast colors, thick bold typography, energetic 'S' lettermark, punchy visual weight, eye-catching composition",
      "Flat Design": "flat 2D iconography, no shadows or gradients, solid fills, geometric 'SB' icon, clean sans-serif font",
      "Vintage": "retro badge shape, aged textures, serif or slab font, distressed details, faded color treatment with elegant lettering",
      "Abstract": "abstract symbolic mark based on letters 'S' and 'B', flowing curves, unique non-literal icon representing brand essence, artistic composition",
      "Geometric": "precise geometric shapes, grid-based 'SB' icon, mathematical symmetry, sharp angles or circles, structured layout",
      "Hand-drawn": "hand-lettered wordmark, organic imperfect strokes, artisanal feel, brush or ink texture, human warmth starting with letters",
    };

    const directive = styleDirectives[style] || "professional, clean, modern design language";

    // Semantic Metaphor Injection: Brainstorm visual cues based on brand name
    const detectMetaphors = (name: string) => {
      const lower = name.toLowerCase();
      const cues = [];
      if (lower.includes('smart') || lower.includes('intel') || lower.includes('mind')) cues.push('sparking lightbulb, neural network lines, brain icon');
      if (lower.includes('intern') || lower.includes('edu') || lower.includes('learn')) cues.push('graduation cap, ascending steps, open book, torch');
      if (lower.includes('tech') || lower.includes('code') || lower.includes('sys') || lower.includes('bit')) cues.push('circuit patterns, pixels, brackets, node link');
      if (lower.includes('eco') || lower.includes('green') || lower.includes('leaf') || lower.includes('nature')) cues.push('organic leaf, sprout, circular flow, earth tones');
      if (lower.includes('flow') || lower.includes('stream') || lower.includes('fast')) cues.push('dynamic swoosh, parallel motion lines, curve');
      if (lower.includes('secure') || lower.includes('trust') || lower.includes('shield')) cues.push('geometric shield, interlocking links, checkmark');
      return cues.length > 0 ? `Incorporate subtle visual metaphors like: ${cues.slice(0, 2).join(", ")}.` : "";
    };

    const metaphorNote = detectMetaphors(brandName);

    // Unique seed phrase derived from brand name to avoid repetitive outputs
    const uniqueSeed = `[VER:4.2][SEED:${brandName.split("").map(c => c.charCodeAt(0)).join("")}]`;

    // Optional brand features/context from the user
    const featureNote = features?.trim()
      ? `Brand Context & Specific Features: ${features.trim().slice(0, 400)}.`
      : "";

    const prompt = [
      `${uniqueSeed}`,
      `A high-end, production-ready logo design for "${brandName}".`,
      `The design must be a composite logo: a unique, recognizable icon mark combined with a professional wordmark.`,
      `Text: The text "${brandName}" must be perfectly legible, using modern premium typography (Geist Sans, Inter, or Playfair Serif style).`,
      `Design Style: ${style} — ${directive}.`,
      metaphorNote,
      `Color: ${colorPart}.`,
      featureNote,
      `Composition: perfectly centered on a PURE WHITE BACKGROUND (#FFFFFF), generous whitespace padding, minimalist layout, vector art style. No mockups.`,
      `Final Quality: razor-sharp edges, high-contrast, scalable icon set, iconic and memorable design.`,
      `Negative Prompt Rules: No photorealistic 3D renders, no complex shadows, no gradients in the background, no wall mockups, no paper textures, no thin lines that disappear when scaled down, no generic clip-art.`,
    ].filter(Boolean).join(" ");

    const result = await hfGenerateImage(prompt);
    trackEvent("logo", brandName);
    return result;
  },

  async generateContent(brandName: string, industry: string): Promise<BrandingContent> {
    const text = await groqChat(
      "You are a professional copywriter and brand strategist. Always respond with valid JSON.",
      `Create complete, polished branding content for a startup named "${brandName}" in the ${industry} industry.

Generate:
1. A powerful, memorable tagline (max 8 words) — no clichés
2. A compelling About Us section (exactly 150 words) — highlight mission, values, and unique differentiator
3. A punchy Instagram bio (max 150 characters) — include a CTA
4. Three engaging social media captions — one each for LinkedIn, Instagram, and Twitter/X

Return a JSON object with keys: tagline (string), aboutUs (string), instagramBio (string), socialCaptions (array of 3 strings).`
    );

    const result = JSON.parse(text);
    trackEvent("content", brandName);
    return result;
  },

  async analyzeSentiment(description: string): Promise<SentimentResult> {
    const text = await groqChat(
      "You are a brand sentiment analyst with expertise in marketing psychology. Always respond with valid JSON.",
      `Analyze the following brand description and evaluate how consumers will perceive it:

"${description}"

Provide:
- A sentiment score from -1.0 (very negative) to 1.0 (very positive)
- A label: exactly one of "Positive", "Neutral", or "Negative"
- Exactly 3 specific, actionable improvement suggestions

Return a JSON object with keys: score (number), label (string), suggestions (array of 3 strings).`
    );

    const result = JSON.parse(text);
    trackEvent("sentiment");
    return result;
  },

  async analyzeReviews(reviews: string[]): Promise<{
    results: Array<{ review: string; score: number; label: string; emoji: string; keyPhrase: string }>;
    summary: { positive: number; neutral: number; negative: number; avgScore: number; overallLabel: string; topInsight: string };
  }> {
    const numbered = reviews.map((r, i) => `Review ${i + 1}: "${r.trim()}"`).join("\n");
    const text = await groqChat(
      "You are an expert consumer sentiment analyst. Always respond with valid JSON only. No markdown, no commentary.",
      `Analyze the sentiment of each customer review below. For each review return:
- score: number from -1.0 (very negative) to 1.0 (very positive)
- label: exactly one of "Positive", "Neutral", or "Negative"
- emoji: a single emoji that best represents the sentiment (e.g. 😊 😐 😠)
- keyPhrase: the most impactful 3-5 word phrase from the review

${numbered}

Also provide a summary object with:
- positive: count of Positive reviews (integer)
- neutral: count of Neutral reviews (integer)  
- negative: count of Negative reviews (integer)
- avgScore: average score across all reviews (number, 2 decimal places)
- overallLabel: one of "Positive", "Neutral", or "Negative"
- topInsight: one actionable sentence based on the review patterns

Return JSON with keys:
- results: array of objects (one per review, in order) each with: score, label, emoji, keyPhrase
- summary: object with the fields listed above`
    );

    const parsed = JSON.parse(text);
    // Reattach original review text to each result
    const results = (parsed.results || []).map((r: any, i: number) => ({
      ...r,
      review: reviews[i] || "",
    }));
    trackEvent("sentiment", "bulk-review");
    return { results, summary: parsed.summary };
  },

  async generateColorPalette(brandName: string, industry: string, mood: string): Promise<ColorPaletteResult> {
    const text = await groqChat(
      "You are a professional brand designer and color theorist. Always respond with valid JSON.",
      `Create a harmonious, professional brand color palette for "${brandName}" in the ${industry} industry with a "${mood}" mood.

Generate exactly 6 colors covering: Primary, Secondary, Accent, Background, Surface, Text.

For each color provide:
- name: descriptive color name (e.g. "Ocean Depth")
- hex: valid hex code (e.g. "#1A3A5C")
- role: one of "Primary", "Secondary", "Accent", "Background", "Surface", "Text"
- description: how to use this color in the brand

Also provide:
- paletteName: a creative name for the overall palette
- mood: the emotional feel of this palette (2-3 words)
- usage: brief guidance on how to apply this palette

Return JSON with keys: paletteName (string), mood (string), colors (array of 6 objects), usage (string).`
    );

    const result = JSON.parse(text);
    trackEvent("palette", brandName);
    return result;
  },

  async auditBrand(brandName: string, description: string, industry: string): Promise<BrandAuditResult> {
    const text = await groqChat(
      "You are an elite brand strategist and auditor. Always respond with valid JSON.",
      `Conduct a comprehensive brand audit for the following brand:

Brand Name: "${brandName}"
Industry: ${industry}
Description: "${description}"

Evaluate on a scale of 0-100 across 5 dimensions:
1. Clarity — Is the brand message clear and understandable?
2. Uniqueness — Does it stand out from competitors?
3. Memorability — Is it easy to remember?
4. Consistency — Does the brand feel cohesive?
5. Emotional Resonance — Does it connect emotionally with the audience?

Also provide:
- overallScore: weighted average (0-100)
- 3 key strengths
- 3 key weaknesses
- 5 specific, actionable recommendations
- summary: 2-sentence executive summary

Return JSON with keys: overallScore (number), scores (object with clarity, uniqueness, memorability, consistency, emotionalResonance as numbers), strengths (array of 3 strings), weaknesses (array of 3 strings), recommendations (array of 5 strings), summary (string).`
    );

    const result = JSON.parse(text);
    trackEvent("audit", brandName);
    return result;
  },

  async suggestLogoIdea(brandName: string): Promise<{ style: string; palette: string; features: string }> {
    const text = await groqChat(
      "You are a master brand identity designer. Always respond with valid JSON.",
      `Based on the brand name "${brandName}", suggest the perfect logo design direction.
      
      Recommend:
      1. A design style from this list: Minimalist, Corporate, Monogram, Futuristic, Bold & Vibrant, Flat Design, Vintage, Abstract, Geometric, Hand-drawn.
      2. A professional color palette (e.g. "Deep Navy and Silver").
      3. A unique feature or visual metaphor to include in the design (max 100 chars).
      
      Return JSON with keys: style (string), palette (string), features (string).`
    );

    const result = JSON.parse(text);
    trackEvent("suggest_logo", brandName);
    return result;
  },

  async checkNameAvailability(name: string): Promise<{ isAvailable: boolean; suggestedDomain: string; reasoning: string }> {
    const text = await groqChat(
      "You are a domain name and trademark expert. Always respond with valid JSON.",
      `Evaluate the brand name "${name}" for availability and digital presence. 
      
      Return a JSON object with:
      - isAvailable: boolean (true if highly likely to be available as a unique brand)
      - suggestedDomain: string (e.g., "${name}.com" or "${name}app.io")
      - reasoning: string (why it might be taken or why it's a good choice)
      
      Note: This is a strategic assessment, not a real-time registrar check.`
    );
    return JSON.parse(text);
  },

  async suggestSimilarName(originalName: string, isUrgent: boolean = false): Promise<BrandName> {
    const text = await groqChat(
      "You are a linguistic expert and brand strategist. Always respond with valid JSON.",
      isUrgent
        ? `The brand name "${originalName}" and its variations are already taken. 
           Suggest ONE new, highly unique, and COINED brand name (abstract word, unlikely to be in any dictionary) that still captures the essence of "${originalName}".
           Priority: Absolute availability and uniqueness for a .com domain.
           Return a JSON object with keys: name (string), explanation (string).`
        : `The brand name "${originalName}" is already taken or unavailable. 
           Suggest ONE new, unique brand name that has the EXACT SAME MEANING or essence as "${originalName}".
           Return a JSON object with keys: name (string), explanation (string).`
    );
    const parsed = JSON.parse(text);
    return parsed;
  },


  createChatSession() {

    return new GroqChatSession(
      `You are BrandStudio AI — an elite branding consultant with 20+ years of combined expertise spanning:
- **Brand Strategy**: Brand architecture, positioning frameworks (perceptual maps, brand ladders), competitive differentiation, USP definition, category design
- **Brand Identity & Naming**: Naming theory (descriptive, evocative, coined, acronym), trademark considerations, phonetics and memorability, global naming viability
- **Visual Identity**: Logo design principles, typography selection, color psychology (emotional associations, cultural implications), visual hierarchy, design systems
- **Tone of Voice**: Brand voice archetypes (Sage, Hero, Creator, etc.), linguistic style guides, messaging frameworks, tagline creation
- **Digital & Content Marketing**: Social media branding, SEO-driven brand content, email copywriting, brand storytelling, content pillars
- **Consumer Psychology**: Perception science, emotional branding, buyer persona development, Jobs-to-Be-Done framework, brand trust signals
- **Startup Branding**: MVP brand identity, lean branding strategies, pitch deck narrative, investor-facing brand communication, growth-stage rebranding

## Response Standards
- Be **specific and actionable** — avoid vague advice like "be consistent"; instead give concrete steps
- Use **frameworks by name** when relevant (e.g., Golden Circle, Brand Pyramid, SWOT, Perceptual Mapping)
- Provide **examples** from real brands to illustrate concepts (Apple, Airbnb, Patagonia, Notion, etc.)
- When asked for names, taglines, or copy — **generate multiple options** with brief rationale for each
- Use **structured formatting**: bullet points, numbered lists, bold headers for complex answers
- If a question is outside branding (e.g., coding, medical, legal) — politely redirect to your area of expertise
- Always ask **clarifying questions** if the user's industry, audience, or brand stage is unclear before giving advice
- Acknowledge when something is **subjective or contextual** (e.g., "this depends on your target market")
- Keep responses **concise but complete** — aim for depth over breadth; don't pad with filler text
- If the user shares a brand name or concept, **evaluate it across**: memorability, pronounceability, trademark risk, emotional resonance, and domain availability likelihood

## Persona & Tone
You are confident, warm, and direct — like a trusted senior strategist who gives honest feedback, not just validation. You celebrate creative thinking but always ground advice in strategy and market reality.`
    );
  },
};
