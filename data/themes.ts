export interface CardTheme {
  bg: string;        // card background hex
  text: string;      // message text hex
  shadowRgb: string; // shadow base as "r, g, b"
  accent: string;    // progress bar, subtle highlights
  isDark: boolean;   // true = dark bg (used to invert signatures)
}

/** Convert hex color to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CARD_THEMES: CardTheme[] = [
  // 0 — Warm Cream (default)
  { bg: "#FFFBF5", text: "#3D2C1E", shadowRgb: "61, 44, 30",  accent: "#C4956A", isDark: false },
  // 1 — Dusty Rose
  { bg: "#F5E1E0", text: "#5C2B2E", shadowRgb: "92, 43, 46",  accent: "#B5706E", isDark: false },
  // 2 — Pale Sage
  { bg: "#E8EDDF", text: "#2F3B2F", shadowRgb: "47, 59, 47",  accent: "#7A9A6D", isDark: false },
  // 3 — Soft Gold
  { bg: "#F7EEDB", text: "#4A3B1F", shadowRgb: "74, 59, 31",  accent: "#C4A44E", isDark: false },
  // 4 — Light Lavender
  { bg: "#EDE8F5", text: "#3B2D5C", shadowRgb: "59, 45, 92",  accent: "#9B7EC8", isDark: false },
  // 5 — Soft Peach
  { bg: "#FBE8DA", text: "#5C3222", shadowRgb: "92, 50, 34",  accent: "#D48B5E", isDark: false },
  // 6 — Pale Blue-Gray
  { bg: "#E5EAF0", text: "#2D3B4A", shadowRgb: "45, 59, 74",  accent: "#7A9AB5", isDark: false },
  // 7 — Light Ochre
  { bg: "#F2E6CE", text: "#4A3520", shadowRgb: "74, 53, 32",  accent: "#B8935A", isDark: false },
  // 8 — Mint Cream
  { bg: "#E2F0EC", text: "#1E3B35", shadowRgb: "30, 59, 53",  accent: "#5DAA96", isDark: false },
  // 9 — Soft Mauve
  { bg: "#EDE0EA", text: "#4A2844", shadowRgb: "74, 40, 68",  accent: "#A86CA0", isDark: false },
  // 10 — Pale Sand
  { bg: "#F5EDE0", text: "#3D3020", shadowRgb: "61, 48, 32",  accent: "#B89E6E", isDark: false },
  // 11 — Light Blush
  { bg: "#F8E5E8", text: "#4A2530", shadowRgb: "74, 37, 48",  accent: "#C47888", isDark: false },
  // 12 — Deep Terracotta
  { bg: "#8B4332", text: "#F5E6DA", shadowRgb: "40, 20, 14",  accent: "#D49880", isDark: true },
  // 13 — Dark Forest
  { bg: "#2D4A3A", text: "#D8E8D8", shadowRgb: "14, 24, 18",  accent: "#6BAA8A", isDark: true },
  // 14 — Dark Slate
  { bg: "#34404A", text: "#D8E2EA", shadowRgb: "16, 22, 28",  accent: "#7A9AB5", isDark: true },
  // 15 — Deep Plum
  { bg: "#4A2848", text: "#E8D8E8", shadowRgb: "24, 12, 24",  accent: "#B580B2", isDark: true },
  // 16 — Dark Umber
  { bg: "#3D3020", text: "#F0E6D4", shadowRgb: "20, 16, 10",  accent: "#C4A44E", isDark: true },
  // 17 — Deep Teal
  { bg: "#1E3B3B", text: "#D4ECEC", shadowRgb: "10, 20, 20",  accent: "#5DAA96", isDark: true },
];
