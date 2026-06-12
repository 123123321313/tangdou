import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from "fs";
import { resolve, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const SRC = resolve(ROOT, "src");
const DIST = resolve(ROOT, "dist");
const ASSETS = resolve(DIST, "assets");
const VENDOR = resolve(DIST, "vendor");

function ensure(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }
function walk(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = resolve(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some(function(x) { return p.endsWith(x); })) out.push(p);
  }
  return out;
}

function readText(p) {
  let s = readFileSync(p, "utf-8");
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  return s;
}

ensure(ASSETS);
ensure(VENDOR);

const nm = resolve(ROOT, "node_modules");

function pickEntry(pkgJson) {
  if (pkgJson.module && typeof pkgJson.module === "string") return pkgJson.module;
  if (pkgJson.exports && typeof pkgJson.exports === "object") {
    const dot = pkgJson.exports["."];
    if (typeof dot === "string") return dot;
    if (dot && typeof dot.import === "string") return dot.import;
    if (dot && dot.import && typeof dot.import.default === "string") return dot.import.default;
  }
  return pkgJson.main || "index.js";
}

function resolvePkg(spec) {
  const parts = spec.split("/");
  let name = parts[0];
  if (spec.startsWith("@")) name = parts[0] + "/" + parts[1];
  const pkgPath = resolve(nm, name, "package.json");
  if (!existsSync(pkgPath)) return null;
  const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8"));
  let entry;
  if (spec.startsWith("@")) {
    const sub = parts.slice(2).join("/");
    if (sub && pkgJson.exports && pkgJson.exports["./" + sub]) {
      const e = pkgJson.exports["./" + sub];
      entry = typeof e === "string" ? e : (e.import || e.default || sub);
    } else {
      entry = sub || pickEntry(pkgJson);
    }
  } else if (spec.includes("/")) {
    const sub = spec.split("/").slice(1).join("/");
    if (pkgJson.exports && pkgJson.exports["./" + sub]) {
      const e = pkgJson.exports["./" + sub];
      entry = typeof e === "string" ? e : (e.import || e.default || sub);
    } else {
      entry = sub;
    }
  } else {
    entry = pickEntry(pkgJson);
  }
  return resolve(nm, name, entry);
}

const vendorMap = {
  "react": "react.mjs",
  "react/jsx-runtime": "react-jsx-runtime.mjs",
  "react-dom": "react-dom.mjs",
  "react-dom/client": "react-dom-client.mjs",
  "react-router": "react-router.mjs",
  "react-router-dom": "react-router-dom.mjs",
  "scheduler": "scheduler.mjs",
  "socket.io-client": "socket.io-client.mjs"
};

for (const name of Object.keys(vendorMap)) {
  const dest = vendorMap[name];
  const srcPath = resolvePkg(name);
  if (!srcPath || !existsSync(srcPath)) { console.log("[!] skip", name, srcPath || "(no pkg)"); continue; }
  copyFileSync(srcPath, resolve(VENDOR, dest));
  console.log("[v]", name, ">>", dest);
}

const routerFile = resolve(nm, "react-router", "dist", "router.mjs");
if (existsSync(routerFile)) {
  copyFileSync(routerFile, resolve(VENDOR, "router.mjs"));
  console.log("[v] router.mjs");
}

const { transform } = require(resolve(nm, "sucrase"));

function stripBOMInline(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function transformCode(file, code) {
  code = stripBOMInline(code);
  if (file.endsWith(".css")) return "";
  if (file.endsWith(".js") || file.endsWith(".jsx")) {
    return transform(code, { transforms: ["jsx"], filePath: file }).code;
  }
  return code;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  let p = resolve(dirname(fromFile), spec);
  if (existsSync(p) && statSync(p).isDirectory()) p = resolve(p, "index.js");
  if (!existsSync(p)) p = p + ".js";
  if (!existsSync(p)) p = p + ".jsx";
  if (!existsSync(p)) p = p + ".ts";
  return p;
}

const cache = new Map();
function inline(file, seen) {
  if (cache.has(file)) return cache.get(file);
  if (seen.has(file)) return "";
  seen.add(file);
  let code = readText(file);
  code = transformCode(file, code);
  // Strip CSS imports
  code = code.replace(/import\s+["']([^"']+\.css)["'];?\s*/g, "");
  // Resolve relative imports first (inline them)
  code = code.replace(/import\s+([\w*\s,{}]+)\s+from\s+["']([^"']+)["'];?/g, function(m, clause, spec) {
    if (spec.startsWith(".")) {
      const t = resolveImport(file, spec);
      if (!t) return "// unresolved: " + spec;
      return inline(t, seen);
    }
    return m;
  });
  code = code.replace(/import\s+["']([^"']+)["'];?/g, function(m, spec) {
    if (spec.startsWith(".")) return "";
    return m;
  });
  // Strip ALL `import React from "react"` (with or without trailing semicolon) - the global one is added below
  code = code.replace(/import\s+React\s+from\s+["']react["']\s*;?/g, "");
  code = code.replace(/^export\s+default\s+/gm, "");
  code = code.replace(/^export\s+/gm, "");
  const out = "// === " + relative(ROOT, file) + " ===\n" + code;
  cache.set(file, out);
  seen.delete(file);
  return out;
}

const sources = walk(SRC, [".jsx", ".js"]);
console.log("[src]", sources.length, "files");

const entryPath = resolve(SRC, "main.jsx");
let body;
try {
  body = inline(entryPath, new Set());
} catch (e) {
  console.log("[bundle] FAIL", e.message);
  process.exit(1);
}

const full = "// generated by build.mjs\nimport React from \"react\";\n" + body + "\n";
writeFileSync(resolve(ASSETS, "main.js"), full, "utf-8");
console.log("[build] OK ->", resolve(ASSETS, "main.js"), full.length, "bytes");

let css = readText(resolve(SRC, "index.css"));
for (const f of sources) {
  const code = readText(f);
  const re = new RegExp("import\\s+[\"']([^\"']+\\.css)[\"'];?", "g");
  let m;
  while ((m = re.exec(code)) !== null) {
    const spec = m[1];
    if (spec.startsWith(".")) {
      const t = resolve(dirname(f), spec);
      if (existsSync(t)) css += "\n/* " + t + " */\n" + readFileSync(t, "utf-8");
    }
  }
}
writeFileSync(resolve(ASSETS, "main.css"), css, "utf-8");
console.log("[css]", css.length, "bytes");

console.log("[done]");