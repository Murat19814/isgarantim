import sharp from "sharp";
import { mkdirSync } from "fs";

const A = "C:/Users/beeli/.cursor/projects/c-Users-beeli-OneDrive-Masa-st-CA-TOOL-PROJE/assets";
const OUT = "C:/Users/beeli/OneDrive/Masaüstü/isgarantim_reklam";
mkdirSync(OUT, { recursive: true });

const S = 1024;
const NAVY = "#0a1730", EM = "#10b981", GOLD = "#E0B44A", WA = "#25D366", RED = "#ef4444";
const FONT = "Arial, 'Segoe UI', sans-serif";

// Kalkan logosu + İşKalkan yazısı (x,y sol üst)
function logo(x, y, light = true) {
  const txt = light ? "#ffffff" : NAVY;
  return `
  <g transform="translate(${x},${y})">
    <rect x="0" y="0" width="66" height="66" rx="18" fill="${light ? "rgba(255,255,255,0.10)" : "rgba(10,23,48,0.06)"}" stroke="${GOLD}" stroke-opacity="0.6" stroke-width="2"/>
    <path d="M33 55 C 21 49, 16 41, 16 30 L16 20 L33 14 L50 20 L50 30 C50 41 45 49 33 55 Z" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/>
    <text x="82" y="46" font-family="${FONT}" font-size="40" font-weight="800" fill="${txt}">İş<tspan fill="${EM}">Kalkan</tspan></text>
  </g>`;
}

function chip(x, y, w, label) {
  return `
  <g transform="translate(${x},${y})">
    <rect x="0" y="0" width="${w}" height="52" rx="26" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)"/>
    <circle cx="30" cy="26" r="7" fill="${EM}"/>
    <text x="50" y="35" font-family="${FONT}" font-size="24" font-weight="700" fill="#ffffff">${label}</text>
  </g>`;
}

function contactBand(yTop, opts = {}) {
  const site = opts.site ?? "isgarantim.com";
  return `
  <rect x="0" y="${yTop}" width="${S}" height="${S - yTop}" fill="url(#scrimB)"/>
  <text x="60" y="${S - 60}" font-family="${FONT}" font-size="40" font-weight="800" fill="#ffffff">${site}</text>
  <text x="${S - 60}" y="${S - 78}" text-anchor="end" font-family="${FONT}" font-size="27" font-weight="700" fill="#ffffff">Tel: 0553 118 37 11</text>
  <text x="${S - 60}" y="${S - 42}" text-anchor="end" font-family="${FONT}" font-size="27" font-weight="800" fill="${WA}">WhatsApp: 0535 663 41 66</text>`;
}

const defs = `
<defs>
  <linearGradient id="scrimB" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${NAVY}" stop-opacity="0"/>
    <stop offset="0.35" stop-color="${NAVY}" stop-opacity="0.85"/>
    <stop offset="1" stop-color="${NAVY}" stop-opacity="0.97"/>
  </linearGradient>
  <linearGradient id="scrimL" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="${NAVY}" stop-opacity="0.92"/>
    <stop offset="1" stop-color="${NAVY}" stop-opacity="0"/>
  </linearGradient>
</defs>`;

// ---------- Poster 1: genel ----------
const p1 = `
<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
${defs}
${logo(48, 44)}
${contactBand(720)}
<g>
  <text x="560" y="330" font-family="${FONT}" font-size="70" font-weight="800" fill="#ffffff">İşin de</text>
  <text x="560" y="405" font-family="${FONT}" font-size="70" font-weight="800" fill="#ffffff">ödemen de</text>
  <text x="560" y="480" font-family="${FONT}" font-size="70" font-weight="800" fill="${GOLD}">güvende.</text>
  <text x="560" y="540" font-family="${FONT}" font-size="27" font-weight="600" fill="#cdd8ea">Doğrulanmış ustalarla, güvenle.</text>
</g>
${chip(560, 585, 300, "Doğrulanmış ustalar")}
${chip(560, 648, 250, "Aynı gün hizmet")}
</svg>`;

// ---------- Poster 2: hizmet al (arka plan açık) ----------
const p2 = `
<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
${defs}
<rect x="0" y="0" width="560" height="${S}" fill="url(#scrimL)"/>
${logo(48, 44)}
<g>
  <text x="60" y="300" font-family="${FONT}" font-size="30" font-weight="800" fill="${EM}">HİZMET Mİ LAZIM?</text>
  <text x="60" y="372" font-family="${FONT}" font-size="62" font-weight="800" fill="#ffffff">Ustaya mı</text>
  <text x="60" y="440" font-family="${FONT}" font-size="62" font-weight="800" fill="#ffffff">ihtiyacın var?</text>
  <text x="60" y="512" font-family="${FONT}" font-size="62" font-weight="800" fill="${GOLD}">Hemen bul.</text>
  <text x="60" y="565" font-family="${FONT}" font-size="26" font-weight="600" fill="#dbe4f1">Çilingir · Tesisat · Elektrik · Boya · Temizlik</text>
  <rect x="60" y="600" width="470" height="66" rx="16" fill="${EM}"/>
  <text x="90" y="642" font-family="${FONT}" font-size="27" font-weight="800" fill="#ffffff">Ücretsiz talep oluştur →</text>
</g>
${contactBand(770)}
</svg>`;

// ---------- Poster 3: usta ----------
const p3 = `
<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
${defs}
${logo(48, 44)}
<g transform="translate(48,130)">
  <rect x="0" y="0" width="360" height="54" rx="27" fill="${GOLD}"/>
  <text x="26" y="36" font-family="${FONT}" font-size="26" font-weight="800" fill="${NAVY}">★ 1. YIL ÜCRETSİZ</text>
</g>
${contactBand(700)}
<g>
  <text x="60" y="560" font-family="${FONT}" font-size="72" font-weight="800" fill="#ffffff">Usta mısın?</text>
  <text x="60" y="636" font-family="${FONT}" font-size="72" font-weight="800" fill="${EM}">İşini büyüt.</text>
</g>
</svg>`;

// ---------- Poster 4: acil ----------
const p4 = `
<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
${defs}
${logo(48, 44)}
${contactBand(700)}
<g>
  <g transform="translate(60,470)">
    <rect x="0" y="0" width="150" height="52" rx="12" fill="${RED}"/>
    <text x="26" y="35" font-family="${FONT}" font-size="27" font-weight="800" fill="#ffffff">ACİL</text>
  </g>
  <text x="60" y="590" font-family="${FONT}" font-size="52" font-weight="800" fill="#ffffff">Çilingir · Su kaçağı</text>
  <text x="60" y="648" font-family="${FONT}" font-size="52" font-weight="800" fill="${GOLD}">Elektrik — hemen yardım</text>
</g>
<text x="60" y="${S - 18}" font-family="${FONT}" font-size="18" font-weight="600" fill="#aebbd0">Hayati tehlike/yangın: önce 112 · 110 · 155</text>
</svg>`;

const jobs = [
  ["base-1-genel.png", p1, "reklam-1-genel.png"],
  ["base-2-hizmet-al.png", p2, "reklam-2-hizmet-al.png"],
  ["base-3-usta.png", p3, "reklam-3-usta.png"],
  ["base-4-acil.png", p4, "reklam-4-acil.png"],
];

for (const [src, svg, out] of jobs) {
  await sharp(`${A}/${src}`)
    .resize(S, S, { fit: "cover" })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .resize(1080, 1080)
    .png()
    .toFile(`${OUT}/${out}`);
  console.log("OK:", `${OUT}/${out}`);
}
console.log("Klasor:", OUT);
