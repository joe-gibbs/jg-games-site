import { useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import powershell from "highlight.js/lib/languages/powershell";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { BlueprintEmbed } from "./components/BlueprintExamples";
import { DocsSearch } from "./components/DocsSearch";
import { LanguageIcon } from "./components/LanguageIcon";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("css", css);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerAliases(["c", "cc", "h", "hpp"], { languageName: "cpp" });
hljs.registerAliases(["html"], { languageName: "xml" });
hljs.registerAliases(["js"], { languageName: "javascript" });
hljs.registerAliases(["ps1"], { languageName: "powershell" });
hljs.registerAliases(["shell", "sh"], { languageName: "bash" });
hljs.registerAliases(["ts"], { languageName: "typescript" });

type DocumentRecord = {
  file: string;
  slug: string;
  title: string;
  source: string;
};

const rawDocuments = import.meta.glob("./content/webkiln/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const documentOrder = [
  "Overview.md",
  "QuickStart.md",
  "TalkToTheGame.md",
  "HUD.md",
  "WorldSpace.md",
  "Textures.md",
  "Input.md",
  "ClickThrough.md",
  "HitTesting.md",
  "HtmlElements.md",
  "Views.md",
  "Bridge.md",
  "Settings.md",
  "Packaging.md",
  "CppAPI.md",
  "Compatibility.md",
  "Diagnostics.md",
  "Troubleshooting.md",
  "SecurityAndSupport.md",
] as const;

const navigationGroups = [
  {
    label: "Start",
    files: ["Overview.md", "QuickStart.md", "TalkToTheGame.md"],
  },
  {
    label: "Build UI",
    files: ["HUD.md", "WorldSpace.md", "Textures.md", "Input.md", "ClickThrough.md", "HitTesting.md", "HtmlElements.md"],
  },
  {
    label: "Reference",
    files: ["Views.md", "Bridge.md", "Settings.md", "Packaging.md", "CppAPI.md"],
  },
  {
    label: "Support",
    files: ["Compatibility.md", "Diagnostics.md", "Troubleshooting.md", "SecurityAndSupport.md"],
  },
] as const;

const slugAliases: Record<string, string> = {
  readme: "overview",
  lifecycle: "views",
  api: "html-elements",
  "getting-started": "quick-start",
  "pointer-vs-world": "click-through",
  "world-input": "click-through",
  "webkiln-hit": "hit-testing",
  "webkiln-texture": "textures",
  "unreal-textures": "textures",
};

const slugFromFile = (file: string) => file
  .replace(/\.md$/i, "")
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

const headingId = (value: string) => value
  .toLowerCase()
  .replace(/[`'*]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const textFromChildren = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode } };
    return textFromChildren(element.props?.children);
  }
  return "";
};

const documents: DocumentRecord[] = documentOrder.map((file) => {
  const entry = Object.entries(rawDocuments).find(([path]) => path.endsWith(`/${file}`));
  if (!entry) throw new Error(`Missing mirrored Webkiln document: ${file}`);
  const source = entry[1];
  const title = source.match(/^#\s+(.+)$/m)?.[1] ?? file.replace(/\.md$/i, "");
  return { file, slug: slugFromFile(file), title, source };
});

const documentsBySlug = new Map(documents.map((document) => [document.slug, document]));
const documentsByFile = new Map(documents.map((document) => [document.file.toLowerCase(), document]));

const languageNames: Record<string, string> = {
  cpp: "C++",
  c: "C",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  powershell: "PowerShell",
  text: "Text",
  typescript: "TypeScript",
  ts: "TypeScript",
};

const markUnrealTypes = (html: string) => html.replace(
  /<span class="hljs-[^"]*">[\s\S]*?<\/span>|([^<]+)/g,
  (match, text: string | undefined) => {
    if (text === undefined) return match;
    return text.replace(
      /\b(?:[UAFTEI][A-Z][A-Za-z0-9_]*|int8|int16|int32|int64|uint8|uint16|uint32|uint64|TCHAR|SIZE_T)\b/g,
      '<span class="hljs-type">$&</span>',
    );
  },
);

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);
  const highlighted = language === "text"
    ? undefined
    : (() => {
        const html = hljs.highlight(code, {
          language: hljs.getLanguage(language) ? language : "plaintext",
          ignoreIllegals: true,
        }).value;
        return language === "cpp" || language === "c" ? markUnrealTypes(html) : html;
      })();

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="docs-code">
      <div className="docs-code-head">
        <span className="docs-code-lang">
          <LanguageIcon language={language} />
          {languageNames[language] ?? language}
        </span>
        <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre>
        {highlighted
          ? <code className={`hljs language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
          : <code>{code}</code>}
      </pre>
    </div>
  );
};

const canonicalSlug = (requested: string) => {
  const resolved = slugAliases[requested] ?? requested;
  return documentsBySlug.has(resolved) ? resolved : "overview";
};

const readLocation = () => {
  const requested = new URLSearchParams(window.location.search).get("doc") ?? "overview";
  return canonicalSlug(requested);
};

function WebkilnDocs() {
  const [selectedSlug, setSelectedSlug] = useState(readLocation);
  const selectedDocument = documentsBySlug.get(selectedSlug) ?? documents[0];

  const openDocument = (slug: string, anchor = "", replace = false) => {
    const target = documentsBySlug.get(slug);
    if (!target) return;
    const url = `${window.location.pathname}?doc=${target.slug}${anchor ? `#${anchor}` : ""}`;
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
    setSelectedSlug(target.slug);
    window.requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView();
      else window.scrollTo({ top: 0 });
    });
  };

  useEffect(() => {
    const onPopState = () => setSelectedSlug(readLocation());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("doc");
    if (!requested) return;
    const resolved = canonicalSlug(requested);
    if (resolved === requested) return;
    const url = `${window.location.pathname}?doc=${resolved}${window.location.hash}`;
    window.history.replaceState({}, "", url);
  }, []);

  useEffect(() => {
    document.title = `${selectedDocument.title} | Webkiln Documentation`;
  }, [selectedDocument.title]);

  const markdownComponents = useMemo(() => ({
    h1: ({ children }: { children?: ReactNode }) => <h1 id={headingId(textFromChildren(children))}>{children}</h1>,
    h2: ({ children }: { children?: ReactNode }) => <h2 id={headingId(textFromChildren(children))}>{children}</h2>,
    h3: ({ children }: { children?: ReactNode }) => <h3 id={headingId(textFromChildren(children))}>{children}</h3>,
    h4: ({ children }: { children?: ReactNode }) => <h4 id={headingId(textFromChildren(children))}>{children}</h4>,
    pre: ({ children }: { children?: ReactNode }) => <>{children}</>,
    code: ({ className, children }: { className?: string; children?: ReactNode }) => {
      const language = className?.match(/language-([\w-]+)/)?.[1];
      const code = String(children ?? "").replace(/\n$/, "");
      if (language === "blueprint") {
        return <BlueprintEmbed ids={code.split(/\s+/).filter(Boolean)} />;
      }
      return language ? <CodeBlock code={code} language={language} /> : <code>{children}</code>;
    },
    table: ({ children }: { children?: ReactNode }) => (
      <div className="docs-table-wrap"><table>{children}</table></div>
    ),
    a: ({ href = "", children }: { href?: string; children?: ReactNode }) => {
      const [path, anchor = ""] = href.split("#");
      const linkedDocument = path.toLowerCase().endsWith(".md")
        ? documentsByFile.get(path.split("/").at(-1)?.toLowerCase() ?? "")
        : undefined;
      if (!linkedDocument) return <a href={href}>{children}</a>;
      const destination = `?doc=${linkedDocument.slug}${anchor ? `#${anchor}` : ""}`;
      const follow = (event: MouseEvent<HTMLAnchorElement>) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openDocument(linkedDocument.slug, anchor);
      };
      return <a href={destination} onClick={follow}>{children}</a>;
    },
  }), []);

  return (
    <div className="docs-page">
      <header className="docs-topbar">
        <a href="/" className="docs-brand" aria-label="JG Games home">
          <img src="/webkiln-logo.svg" alt="" />
          <span>Webkiln</span>
        </a>
        <nav aria-label="Documentation links">
          <a href="/webkiln/downloads/">Downloads</a>
          <a href="/">JG Games</a>
          <a href="mailto:contact@jggames.dev">Support</a>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <DocsSearch
            documents={documents}
            onNavigate={(slug, heading) => openDocument(slug, heading ?? "")}
          />
          <nav aria-label="Webkiln documentation">
            {navigationGroups.map((group) => (
              <div className="docs-nav-group" key={group.label}>
                <span>{group.label}</span>
                {group.files.map((file) => {
                  const document = documentsByFile.get(file.toLowerCase());
                  if (!document) return null;
                  return (
                    <button
                      className={document.slug === selectedSlug ? "is-active" : ""}
                      type="button"
                      onClick={() => openDocument(document.slug)}
                      key={document.file}
                    >
                      {document.title}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        <main className="docs-main">
          <article key={selectedDocument.slug}>
            <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {selectedDocument.source}
            </Markdown>
            <footer className="docs-footer">
              <img src="/webkiln-logo.svg" alt="" />
              <div>
                <strong>Webkiln</strong>
                <span>Documentation</span>
              </div>
              <a href="mailto:contact@jggames.dev">contact@jggames.dev</a>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
}

export default WebkilnDocs;
