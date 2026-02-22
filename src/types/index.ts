export interface BrandName {
  name: string;
  explanation: string;
}

export interface BrandingContent {
  tagline: string;
  aboutUs: string;
  instagramBio: string;
  socialCaptions: string[];
}

export interface SentimentResult {
  score: number;
  label: "Positive" | "Neutral" | "Negative";
  suggestions: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
  description: string;
}

export interface ColorPaletteResult {
  paletteName: string;
  mood: string;
  colors: ColorSwatch[];
  usage: string;
}

export interface BrandAuditResult {
  overallScore: number;
  scores: {
    clarity: number;
    uniqueness: number;
    memorability: number;
    consistency: number;
    emotionalResonance: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
}

export type AnalyticsEventType = 'brand_name' | 'logo' | 'content' | 'sentiment' | 'chat' | 'palette' | 'audit' | 'suggest_logo' | 'suggest_names';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  label?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  type: 'logo' | 'palette' | 'brand_name' | 'content' | 'audit' | 'sentiment';

  url?: string;
  data?: any;
  label: string;
  timestamp: number;
}


