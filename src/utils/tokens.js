// ─── ROBSTAR KASI — Design Tokens ───────────────────────────────
// All colours, fonts and reusable style constants live here.
// Import T into any component that needs styling.

export const T = {
  // Backgrounds
  base:    "#09090F",
  surface: "#111118",
  card:    "#16161F",
  cardHov: "#1C1C28",

  // Borders
  border:       "#252535",
  borderBright: "#32324A",

  // Brand — Red
  red:     "#CC0000",
  redDim:  "#8A0000",
  redGlow: "rgba(204,0,0,0.15)",

  // Brand — Blue
  blue:    "#1A3A8A",
  blueMid: "#2A52BA",
  blueDim: "rgba(26,58,138,0.2)",

  // Text
  white:    "#FFFFFF",
  offWhite: "#E8E8F0",
  muted:    "#888899",
  faint:    "#444455",

  // Typography
  font: "'Space Grotesk', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

// Status badge config — used by Badge component
export const STATUS_CONFIG = {
  pending:    { bg:"rgba(204,164,0,0.12)",  border:"rgba(204,164,0,0.4)",  text:"#CCA400", label:"Pending"    },
  confirmed:  { bg:"rgba(26,58,138,0.18)",  border:"rgba(42,82,186,0.5)",  text:"#6B9EFF", label:"Confirmed"  },
  dispatched: { bg:"rgba(120,60,200,0.15)", border:"rgba(140,80,220,0.4)", text:"#B06EFF", label:"Dispatched" },
  delivered:  { bg:"rgba(0,180,100,0.12)",  border:"rgba(0,200,110,0.4)",  text:"#00C86E", label:"Delivered"  },
  cancelled:  { bg:"rgba(204,0,0,0.12)",    border:"rgba(204,0,0,0.4)",    text:"#FF5555", label:"Cancelled"  },
};

// Nav items — shared by Sidebar and MobileNav
export const NAV_ITEMS = [
  { id:"dashboard", icon:"▣",  label:"Dashboard",      admin:false },
  { id:"catalogue", icon:"⬡",  label:"Parts Catalogue", admin:false },
  { id:"cart",      icon:"◎",  label:"Cart",            admin:false },
  { id:"orders",    icon:"≡",  label:"My Orders",       admin:false },
  { id:"allorders", icon:"◈",  label:"All Orders",      admin:true  },
  { id:"inventory", icon:"◫",  label:"Inventory",       admin:true  },
];