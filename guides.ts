import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, Fragment } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import type { Plugin } from "vite";
import { webkilnFabUrl } from "./src/webkilnDownloads.ts";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerAliases(["html"], { languageName: "xml" });
hljs.registerAliases(["js"], { languageName: "javascript" });
hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });

const site = "https://jggames.dev";
const guidesDirectory = resolve(__dirname, "src/content/webkiln/guides");
const publicDirectory = resolve(__dirname, "public");

export type Guide = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  image?: string;
  body: string;
};

function imageSize(src: string): { width: number; height: number } {
  const bytes = readFileSync(resolve(publicDirectory, `.${src}`));
  if (bytes.readUInt32BE(0) === 0x89504e47) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw new Error(`Cannot read image size of ${src}`);
}

const languageNames: Record<string, string> = {
  bash: "Shell",
  cpp: "C++",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  json: "JSON",
  text: "Text",
  tsx: "TSX",
  typescript: "TypeScript",
};

const languageIcons: Record<string, string> = {
  html: "/webkiln/lang-icons/html.svg",
  css: "/webkiln/lang-icons/css.svg",
  javascript: "/webkiln/lang-icons/javascript.svg",
  typescript: "/webkiln/lang-icons/typescript.svg",
  tsx: "/webkiln/lang-icons/typescript.svg",
  cpp: "/webkiln/lang-icons/cpp.svg",
  json: "/webkiln/lang-icons/json.svg",
};

const escape = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const headingId = (value: string) => value
  .toLowerCase()
  .replace(/[`'*]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const textOf = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textOf).join("");
  if (children && typeof children === "object" && "props" in children) {
    return textOf((children as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
};

function parseGuide(file: string): Guide {
  const source = readFileSync(resolve(guidesDirectory, file), "utf8").replace(/\r\n/g, "\n");
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Guide ${file} is missing front matter`);
  const fields = Object.fromEntries(match[1].split("\n").map((line) => {
    const separator = line.indexOf(":");
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  for (const key of ["title", "description", "updated"]) {
    if (!fields[key]) throw new Error(`Guide ${file} is missing ${key}`);
  }
  return {
    slug: file.replace(/\.md$/, ""),
    title: fields.title,
    description: fields.description,
    updated: fields.updated,
    image: fields.image,
    body: match[2],
  };
}

export const guides: Guide[] = readdirSync(guidesDirectory)
  .filter((file) => file.endsWith(".md"))
  .sort()
  .map(parseGuide);

const heading = (level: 1 | 2 | 3) => ({ children }: { children?: ReactNode }) =>
  createElement(`h${level}`, { id: headingId(textOf(children)) }, children);

const components: Components = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  pre: ({ children }) => createElement(Fragment, null, children),
  p: ({ node, children }) => {
    const only = node?.children.length === 1 ? node.children[0] : undefined;
    const isImage = only?.type === "element" && only.tagName === "img";
    return isImage ? createElement(Fragment, null, children) : createElement("p", null, children);
  },
  img: ({ src, alt, title }) => {
    if (!src?.startsWith("/")) throw new Error(`Guide images must be site paths: ${src}`);
    const { width, height } = imageSize(src);
    return createElement("figure", { className: "guide-figure" },
      createElement("img", { src, alt: alt ?? "", width, height, loading: "lazy", decoding: "async" }),
      title ? createElement("figcaption", null, title) : null);
  },
  table: ({ children }) => createElement("div", { className: "docs-table-wrap" }, createElement("table", null, children)),
  code: ({ className, children }) => {
    const language = className?.match(/language-([\w-]+)/)?.[1];
    if (!language) return createElement("code", null, children);
    const code = String(children ?? "").replace(/\n$/, "");
    const highlighted = language === "text"
      ? escape(code)
      : hljs.highlight(code, { language: hljs.getLanguage(language) ? language : "plaintext", ignoreIllegals: true }).value;
    const icon = languageIcons[language];
    return createElement("div", { className: "docs-code" },
      createElement("div", { className: "docs-code-head" },
        createElement("span", { className: "docs-code-lang" },
          icon ? createElement("img", { className: "lang-icon", src: icon, alt: "", width: 14, height: 14 }) : null,
          languageNames[language] ?? language),
        createElement("button", { type: "button", "data-copy": "" }, "Copy")),
      createElement("pre", null,
        createElement("code", { className: `hljs language-${language}`, dangerouslySetInnerHTML: { __html: highlighted } })));
  },
};

const renderMarkdown = (source: string) =>
  renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm], components }, source));

const guideUrl = (slug?: string) => `${site}/webkiln/guides/${slug ? `${slug}/` : ""}`;

const trialUrl = (content: string) =>
  `/webkiln/try/?utm_source=guide&amp;utm_medium=docs&amp;utm_campaign=guides&amp;utm_content=${content}#trial`;

function page(options: { title: string; description: string; url: string; type: string; image?: string; jsonLd: object; content: string }) {
  const social = options.image
    ? `
    <meta property="og:image" content="${site}${options.image}" />
    <meta name="twitter:card" content="summary_large_image" />`
    : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#11100e" />
    <link rel="icon" type="image/svg+xml" href="/webkiln-logo.svg" />
    <title>${escape(options.title)}</title>
    <meta name="description" content="${escape(options.description)}" />
    <link rel="canonical" href="${options.url}" />
    <meta property="og:type" content="${options.type}" />
    <meta property="og:site_name" content="Webkiln" />
    <meta property="og:title" content="${escape(options.title)}" />
    <meta property="og:description" content="${escape(options.description)}" />
    <meta property="og:url" content="${options.url}" />${social}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify(options.jsonLd).replace(/</g, "\\u003c")}</script>
  </head>
  <body>
    <div class="docs-page guide-page">
      <header class="docs-topbar">
        <a href="/webkiln/" class="docs-brand"><img src="/webkiln-logo.svg" alt="" /><span>Webkiln</span></a>
        <nav aria-label="Webkiln">
          <a href="/webkiln/guides/">Guides</a>
          <a href="/webkiln/docs/">Docs</a>
          <a href="/webkiln/downloads/">Downloads</a>
          <a href="${webkilnFabUrl}" target="_blank" rel="noopener noreferrer">Fab</a>
        </nav>
      </header>
      <main class="docs-main guide-main">
        <article>
${options.content}
          <footer class="docs-footer">
            <img src="/webkiln-logo.svg" alt="" />
            <div><strong>Webkiln</strong><span>JG Games</span></div>
            <nav aria-label="Support">
              <a href="/webkiln/docs/">Documentation</a>
              <a href="https://discord.gg/HZkcDwkdBU" target="_blank" rel="noopener noreferrer">Discord</a>
              <a href="mailto:contact@jggames.dev">contact@jggames.dev</a>
            </nav>
          </footer>
        </article>
      </main>
    </div>
    <script type="module" src="/src/guide-main.ts"></script>
  </body>
</html>
`;
}

const callToAction = (content: string) => `<aside class="guide-cta">
  <div>
    <strong>Try Webkiln in your own project</strong>
    <span>Free watermarked trial for Unreal Engine 4.25–5.8 on Windows. From US$49.99 on Fab.</span>
  </div>
  <div class="guide-cta-links">
    <a class="guide-cta-primary" href="${trialUrl(content)}">Download the trial</a>
    <a href="${webkilnFabUrl}" target="_blank" rel="noopener noreferrer">View on Fab</a>
  </div>
</aside>`;

function renderGuide(guide: Guide) {
  const url = guideUrl(guide.slug);
  const others = guides.filter((other) => other.slug !== guide.slug);
  const related = others.length
    ? `<section class="guide-related"><h2>More guides</h2><ul>${others.map((other) =>
        `<li><a href="/webkiln/guides/${other.slug}/">${escape(other.title)}</a></li>`).join("")}</ul></section>`
    : "";
  return page({
    title: `${guide.title} | Webkiln`,
    description: guide.description,
    url,
    type: "article",
    image: guide.image,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: guide.title,
      description: guide.description,
      ...(guide.image ? { image: `${site}${guide.image}` } : {}),
      dateModified: guide.updated,
      url,
      author: { "@type": "Organization", name: "JG Games", url: site },
      publisher: { "@type": "Organization", name: "JG Games", url: site },
    },
    content: `${renderMarkdown(guide.body)}\n${callToAction(guide.slug)}\n${related}`,
  });
}

function renderIndex() {
  const description = "Step-by-step guides for building Unreal Engine game UI with HTML, CSS, JavaScript and React using Webkiln.";
  const list = guides.map((guide) => `<li>
  <a href="/webkiln/guides/${guide.slug}/">
    ${guide.image ? (() => { const size = imageSize(guide.image); return `<img src="${guide.image}" alt="" width="${size.width}" height="${size.height}" loading="lazy" decoding="async" />`; })() : ""}
    <div>
      <strong>${escape(guide.title)}</strong>
      <span>${escape(guide.description)}</span>
    </div>
  </a>
</li>`).join("\n");
  return page({
    title: "Unreal Engine HTML and React UI guides | Webkiln",
    description,
    url: guideUrl(),
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Webkiln guides",
      description,
      url: guideUrl(),
    },
    content: `<h1 id="guides">Guides</h1>
<p>${escape(description)}</p>
<ul class="guide-list">
${list}
</ul>
${callToAction("index")}`,
  });
}

export const guideInputs = Object.fromEntries([
  ["webkilnGuides", resolve(__dirname, "webkiln/guides/index.html")],
  ...guides.map((guide) => [`webkilnGuide-${guide.slug}`, resolve(__dirname, `webkiln/guides/${guide.slug}/index.html`)]),
]);

const sitemapPaths = [
  "/",
  "/webkiln/",
  "/webkiln/try/",
  "/webkiln/docs/",
  "/webkiln/downloads/",
  "/webkiln/guides/",
  ...guides.map((guide) => `/webkiln/guides/${guide.slug}/`),
];

export function webkilnGuides(): Plugin {
  return {
    name: "webkiln-guides",
    transformIndexHtml: {
      order: "pre",
      handler(_html, context) {
        const match = context.filename.replace(/\\/g, "/").match(/\/webkiln\/guides\/(?:([^/]+)\/)?index\.html$/);
        if (!match) return;
        if (!match[1]) return renderIndex();
        const guide = guides.find((candidate) => candidate.slug === match[1]);
        if (!guide) throw new Error(`No guide source for ${match[1]}`);
        return renderGuide(guide);
      },
    },
    generateBundle() {
      const urls = sitemapPaths.map((path) => `  <url><loc>${site}${path}</loc></url>`).join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
    },
  };
}
