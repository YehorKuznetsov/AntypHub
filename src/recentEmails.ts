const KEY = 'antyp_hub_recent_emails';
const MAX = 5;

export function getRecentEmails(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export function saveRecentEmail(email: string): void {
    if (typeof window === 'undefined') return;
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    const current = getRecentEmails();
    const filtered = current.filter((e) => e.toLowerCase() !== trimmed);
    const next = [trimmed, ...filtered].slice(0, MAX);
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        // ignore quota / serialization errors
    }
}
