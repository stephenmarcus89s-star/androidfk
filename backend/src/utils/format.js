// Pretty-print bytes as MB / KB
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    if (mb >= 100) return `${Math.round(mb)} MB`;
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

// Generate believable rating distribution given an average rating
export function ratingDistribution(avg) {
  const a = Math.max(4.3, Math.min(5.0, Number(avg) || 4.8));
  // Higher avg → more 5-star
  const total = 983 + Math.floor(Math.random() * 200); // ~983–1182 reviews
  // Weights derived from average
  const w5 = Math.round((a - 4.0) * 100);          // ~30–100
  const w4 = Math.round((5.0 - a) * 60 + 12);      // ~12–24
  const w3 = Math.max(2, Math.round((5.0 - a) * 8));
  const w2 = Math.max(1, Math.round((5.0 - a) * 4));
  const w1 = Math.max(1, Math.round((5.0 - a) * 3));
  const sumW = w5 + w4 + w3 + w2 + w1;
  const s5 = Math.round((w5 / sumW) * total);
  const s4 = Math.round((w4 / sumW) * total);
  const s3 = Math.round((w3 / sumW) * total);
  const s2 = Math.round((w2 / sumW) * total);
  const s1 = total - s5 - s4 - s3 - s2;
  return { total, breakdown: { 5: s5, 4: s4, 3: s3, 2: s2, 1: s1 } };
}

// Parse changelog string into array
export function parseChangelog(raw) {
  if (!raw) return [];
  // Try JSON first
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j)) return j.map(String);
  } catch { /* not JSON */ }
  // Treat as newline or • separated
  return raw
    .split(/[\n\r]+|•|\u2022/)
    .map(s => s.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean);
}

// Safe user-input trim
export function cleanStr(s) {
  if (s === null || s === undefined) return s;
  return String(s).trim();
}
