// ─────────────────────────────────────────────────────────────────────────────
// gemini.ts – AI SERVICES DISABLED
// All API calls to Groq (LLaMA) and HuggingFace (FLUX) have been intentionally
// disabled.  Every public method now rejects immediately with a ServiceError so
// that the UI can display the maintenance alert.  No API keys are used.
// ─────────────────────────────────────────────────────────────────────────────

import type { BrandName, BrandingContent, SentimentResult, ColorPaletteResult, BrandAuditResult } from "../types";

// ── Shared error thrown by every disabled endpoint ────────────────────────────
export class ServiceError extends Error {
  constructor() {
    super("Service stopped due to technical issues. Please try again later.");
    this.name = "ServiceError";
  }
}

const stopped = () => Promise.reject(new ServiceError());

// ── Disabled multi-turn chat session ─────────────────────────────────────────
class DisabledChatSession {
  sendMessage(_: { message: string }): Promise<{ text: string }> {
    return stopped() as Promise<{ text: string }>;
  }
}

// ── Public service (all methods disabled) ─────────────────────────────────────
export const geminiService = {
  generateBrandNames(_industry: string, _audience: string, _personality: string): Promise<BrandName[]> {
    return stopped() as Promise<BrandName[]>;
  },

  suggestNamingContext(): Promise<{ industry: string; audience: string; personality: string }> {
    return stopped() as Promise<{ industry: string; audience: string; personality: string }>;
  },

  generateLogo(_brandName: string, _style: string, _palette: string, _features?: string): Promise<string> {
    return stopped() as Promise<string>;
  },

  generateContent(_brandName: string, _industry: string): Promise<BrandingContent> {
    return stopped() as Promise<BrandingContent>;
  },

  analyzeSentiment(_description: string): Promise<SentimentResult> {
    return stopped() as Promise<SentimentResult>;
  },

  analyzeReviews(_reviews: string[]): Promise<{
    results: Array<{ review: string; score: number; label: string; emoji: string; keyPhrase: string }>;
    summary: { positive: number; neutral: number; negative: number; avgScore: number; overallLabel: string; topInsight: string };
  }> {
    return stopped() as Promise<any>;
  },

  generateColorPalette(_brandName: string, _industry: string, _mood: string): Promise<ColorPaletteResult> {
    return stopped() as Promise<ColorPaletteResult>;
  },

  auditBrand(_brandName: string, _description: string, _industry: string): Promise<BrandAuditResult> {
    return stopped() as Promise<BrandAuditResult>;
  },

  suggestLogoIdea(_brandName: string): Promise<{ style: string; palette: string; features: string }> {
    return stopped() as Promise<{ style: string; palette: string; features: string }>;
  },

  checkNameAvailability(_name: string): Promise<{ isAvailable: boolean; suggestedDomain: string; reasoning: string }> {
    return stopped() as Promise<{ isAvailable: boolean; suggestedDomain: string; reasoning: string }>;
  },

  suggestSimilarName(_originalName: string, _isUrgent: boolean = false): Promise<BrandName> {
    return stopped() as Promise<BrandName>;
  },

  createChatSession(): DisabledChatSession {
    return new DisabledChatSession();
  },
};
