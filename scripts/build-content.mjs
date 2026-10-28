// Compiles content/ into src/data/content.json.
//   content/<theme>/*.md          -> pieces (Read)
//   content/ask/<category>/*.md   -> questions (Ask & Find)
//   content/ask/_start.md         -> the "Start here" path
// No dependencies: a small front-matter parser is enough for our files.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("../content/", import.meta.url).pathname;
const OUT = new URL("../src/data/content.json", import.meta.url).pathname;

function parseFrontMatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return [{}, raw.trim()];
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) meta[key] = val.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
    else if (val.startsWith('"') && val.endsWith('"')) meta[key] = val.slice(1, -1).replace(/\\"/g, '"');
    else if (/^-?\d+$/.test(val)) meta[key] = Number(val);
    else meta[key] = val;
  }
  return [meta, m[2].trim()];
}

const mdFiles = (dir) => readdirSync(dir).filter((f) => f.endsWith(".md")).sort();

// ---------- Read: themes and pieces ----------
const themes = [];
const pieces = [];
for (const dir of readdirSync(ROOT)) {
  const full = join(ROOT, dir);
  if (!statSync(full).isDirectory() || dir === "ask") continue;
  const files = mdFiles(full);
  if (!files.includes("_theme.md")) continue;
  const [tm, intro] = parseFrontMatter(readFileSync(join(full, "_theme.md"), "utf8"));
  const theme = { key: dir, title: tm.title, tagline: tm.tagline, accent: tm.accent, order: tm.order ?? 99, intro, count: 0 };
  let order = 0;
  for (const f of files) {
    if (f === "_theme.md") continue;
    const [pm, body] = parseFrontMatter(readFileSync(join(full, f), "utf8"));
    const slug = basename(f, ".md");
    pieces.push({
      id: `${dir}/${slug}`, theme: dir, slug,
      type: pm.type || "line", author: pm.author || "", title: pm.title || "",
      source: pm.source || "", url: pm.url || "",
      quote: pm.quote || "", quoteAuthor: pm.quoteAuthor || "", quoteSource: pm.quoteSource || "",
      note: pm.note || "", tags: Array.isArray(pm.tags) ? pm.tags : [], body, order: order++,
    });
    theme.count++;
  }
  themes.push(theme);
}
themes.sort((a, b) => a.order - b.order);
const rank = { letter: 0, reflection: 1, line: 2 };
pieces.sort((a, b) => a.theme.localeCompare(b.theme) || rank[a.type] - rank[b.type] || a.order - b.order);
const pieceIds = new Set(pieces.map((p) => p.id));

// ---------- Ask & Find: categories and questions ----------
const categories = [];
const questions = [];
let start = [];
const ASK = join(ROOT, "ask");
if (existsSync(ASK)) {
  for (const dir of readdirSync(ASK)) {
    const full = join(ASK, dir);
    if (!statSync(full).isDirectory()) continue;
    const files = mdFiles(full);
    if (!files.includes("_category.md")) continue;
    const [cm, intro] = parseFrontMatter(readFileSync(join(full, "_category.md"), "utf8"));
    const cat = { key: dir, title: cm.title, tagline: cm.tagline, accent: cm.accent, order: cm.order ?? 99, intro, count: 0 };
    for (const f of files) {
      if (f === "_category.md") continue;
      const [qm, text] = parseFrontMatter(readFileSync(join(full, f), "utf8"));
      const slug = basename(f, ".md");
      if (qm.read && !pieceIds.has(qm.read)) console.warn(`warn: ${dir}/${slug} links to missing piece ${qm.read}`);
      questions.push({
        id: `${dir}/${slug}`, cat: dir, slug, text,
        why: qm.why || "", deeper: qm.deeper || "", read: pieceIds.has(qm.read) ? qm.read : "",
        tags: Array.isArray(qm.tags) ? qm.tags : [], order: qm.order ?? 999,
      });
      cat.count++;
    }
    categories.push(cat);
  }
  categories.sort((a, b) => a.order - b.order);
  questions.sort((a, b) => a.cat.localeCompare(b.cat) || a.order - b.order);
  const startFile = join(ASK, "_start.md");
  if (existsSync(startFile)) {
    const [, body] = parseFrontMatter(readFileSync(startFile, "utf8"));
    const qids = new Set(questions.map((q) => q.id));
    start = body.split("\n").map((s) => s.trim()).filter((s) => s && qids.has(s));
  }
}

mkdirSync(new URL("../src/data/", import.meta.url).pathname, { recursive: true });
writeFileSync(OUT, JSON.stringify({ themes, pieces, categories, questions, start, builtAt: new Date().toISOString() }, null, 2));
console.log(`content: ${themes.length} themes, ${pieces.length} pieces, ${categories.length} categories, ${questions.length} questions, start path ${start.length}`);
