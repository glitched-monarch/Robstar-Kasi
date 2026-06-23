/* ── ROBSTAR KASI DESIGN TOKENS ── */

export const T = {
  /* Backgrounds */
  base:    "#08080E",
  surface: "#0F0F18",
  card:    "#14141E",
  cardHov: "#1A1A26",

  /* Borders */
  border:       "#1F1F30",
  borderBright: "#2E2E48",

  /* Brand */
  red:     "#E0141A",
  redDim:  "#9A0D11",
  redGlow: "rgba(224,20,26,0.15)",
  redMid:  "rgba(224,20,26,0.08)",

  /* Accent blue */
  blue:    "#1A3A8A",
  blueMid: "#2A52BA",
  blueDim: "rgba(26,58,138,0.2)",

  /* Text */
  white:    "#FFFFFF",
  offWhite: "#E6E6F0",
  muted:    "#7A7A9A",
  faint:    "#3A3A5A",

  /* Status */
  green:  "#00C870",
  yellow: "#CCA400",
  purple: "#B06EFF",

  /* Typography */
  font: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",

  /* Radius */
  r:  "8px",
  rl: "12px",
  rx: "16px",

  /* Mobile breakpoints (use in JS) */
  mobile: 768,
};

export const STATUS = {
  pending:    { bg:"rgba(204,164,0,0.10)", border:"rgba(204,164,0,0.35)", text:"#CCA400",  label:"Pending"    },
  confirmed:  { bg:"rgba(26,58,138,0.15)", border:"rgba(42,82,186,0.40)", text:"#6B9EFF",  label:"Confirmed"  },
  dispatched: { bg:"rgba(120,60,200,0.12)",border:"rgba(140,80,220,0.35)",text:"#B06EFF",  label:"Dispatched" },
  delivered:  { bg:"rgba(0,180,100,0.10)", border:"rgba(0,200,110,0.35)", text:"#00C870",  label:"Delivered"  },
  cancelled:  { bg:"rgba(224,20,26,0.10)", border:"rgba(224,20,26,0.35)", text:"#FF5555",  label:"Cancelled"  },
};

export const fmt = (n) => `KES ${Number(n).toLocaleString("en-KE")}`;
