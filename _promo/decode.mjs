import { readFileSync, writeFileSync, mkdirSync } from "fs";

const outDir = "C:/Users/beeli/OneDrive/Masaüstü/isgarantim_reklam";
mkdirSync(outDir, { recursive: true });

const files = [
  ["C:/Users/beeli/.cursor/browser-logs/cdp-response-Page.captureScreenshot-2026-09-14T14-22-09-702Z.json", "reklam-1-genel.png"],
  ["C:/Users/beeli/.cursor/browser-logs/cdp-response-Page.captureScreenshot-2026-09-14T14-32-18-719Z.json", "reklam-2-hizmet-al.png"],
  ["C:/Users/beeli/.cursor/browser-logs/cdp-response-Page.captureScreenshot-2026-09-14T14-36-17-998Z.json", "reklam-3-usta.png"],
];

function findData(obj) {
  if (obj == null) return null;
  if (typeof obj === "string") return obj.length > 1000 ? obj : null;
  if (typeof obj === "object") {
    if (typeof obj.data === "string") return obj.data;
    for (const k of Object.keys(obj)) {
      const r = findData(obj[k]);
      if (r) return r;
    }
  }
  return null;
}

for (const [src, name] of files) {
  const raw = readFileSync(src, "utf8");
  let data;
  try {
    data = findData(JSON.parse(raw));
  } catch {
    const m = raw.match(/"data"\s*:\s*"([A-Za-z0-9+/=]+)"/);
    data = m ? m[1] : null;
  }
  if (!data) { console.log("VERI YOK:", src); continue; }
  writeFileSync(`${outDir}/${name}`, Buffer.from(data, "base64"));
  console.log("OK:", `${outDir}/${name}`);
}
console.log("Klasor:", outDir);
