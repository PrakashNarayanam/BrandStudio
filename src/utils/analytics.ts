import { AnalyticsEvent, AnalyticsEventType } from '../types';

const KEY = 'bc-analytics';

export function trackEvent(type: AnalyticsEventType, label?: string) {
    const events: AnalyticsEvent[] = getEvents();
    events.push({ type, timestamp: Date.now(), label });
    // Keep last 500 events only
    if (events.length > 500) events.splice(0, events.length - 500);
    localStorage.setItem(KEY, JSON.stringify(events));
}

export function getEvents(): AnalyticsEvent[] {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

export function clearEvents() {
    localStorage.removeItem(KEY);
}

export function getStats() {
    const events = getEvents();
    const now = Date.now();
    const day = 86400000;

    const counts: Record<AnalyticsEventType, number> = {
        brand_name: 0, logo: 0, content: 0,
        sentiment: 0, chat: 0, palette: 0, audit: 0,
        suggest_logo: 0, suggest_names: 0,
    };
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });

    // Last 7 days
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const dayStart = now - (6 - i) * day;
        const dayEnd = dayStart + day;
        const date = new Date(dayStart);
        return {
            label: date.toLocaleDateString('en', { weekday: 'short' }),
            count: events.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd).length,
        };
    });

    const total = events.length;
    const today = events.filter(e => e.timestamp >= now - day).length;
    const topFeature = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const recent = [...events].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    return { counts, last7, total, today, topFeature, recent };
}
