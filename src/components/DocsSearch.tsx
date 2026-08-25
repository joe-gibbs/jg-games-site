import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

type SearchDocument = {
  slug: string;
  title: string;
  source: string;
};

type SearchHit = {
  slug: string;
  title: string;
  heading: string;
  headingId: string;
  snippet: string;
  score: number;
};

const headingId = (value: string) => value
  .toLowerCase()
  .replace(/[`'*]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

const stripMarkup = (source: string) => source
  .replace(/```blueprint\b[\s\S]*?```/gi, " ")
  .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*/g, " "))
  .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
  .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/^#{1,6}\s+/gm, "")
  .replace(/[*_~|>]/g, " ")
  .replace(/\|/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const sectionsFrom = (source: string) => {
  const sections: { heading: string; headingId: string; text: string }[] = [];
  let heading = "";
  let currentId = "";
  let body: string[] = [];

  const flush = () => {
    const text = stripMarkup(body.join("\n"));
    if (!heading && !text) return;
    sections.push({ heading, headingId: currentId, text });
  };

  for (const line of source.split("\n")) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      flush();
      heading = match[2].replace(/[`*_]/g, "").trim();
      currentId = headingId(heading);
      body = [];
    } else {
      body.push(line);
    }
  }
  flush();
  return sections;
};

const buildIndex = (documents: SearchDocument[]) => documents.flatMap((document) => {
  const sections = sectionsFrom(document.source);
  return sections.map((section, index) => ({
    slug: document.slug,
    title: document.title,
    heading: section.heading || document.title,
    headingId: index === 0 || section.heading === document.title ? "" : section.headingId,
    text: `${document.title} ${section.heading} ${section.text}`.trim(),
  }));
});

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const snippetAround = (text: string, terms: string[]) => {
  const lower = text.toLowerCase();
  let at = -1;
  let matched = terms[0] ?? "";
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found >= 0 && (at < 0 || found < at)) {
      at = found;
      matched = term;
    }
  }
  if (at < 0) return escapeHtml(text.slice(0, 140));
  const start = Math.max(0, at - 42);
  const end = Math.min(text.length, at + matched.length + 78);
  const slice = `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "ig");
  return escapeHtml(slice).replace(pattern, "<mark>$1</mark>");
};

const searchDocs = (index: ReturnType<typeof buildIndex>, query: string): SearchHit[] => {
  const terms = query.toLowerCase().trim().split(/\s+/).filter((term) => term.length > 0);
  if (!terms.length) return [];

  const hits: SearchHit[] = [];
  for (const entry of index) {
    const hay = entry.text.toLowerCase();
    const title = entry.title.toLowerCase();
    const heading = entry.heading.toLowerCase();
    if (terms.some((term) => !hay.includes(term))) continue;

    let score = 0;
    const phrase = terms.join(" ");
    if (title === phrase) score += 80;
    if (title.includes(phrase)) score += 40;
    if (heading.includes(phrase)) score += 28;
    if (hay.includes(phrase)) score += 12;
    for (const term of terms) {
      if (title.startsWith(term)) score += 18;
      else if (title.includes(term)) score += 12;
      if (heading.includes(term)) score += 8;
      score += 3;
    }
    hits.push({
      slug: entry.slug,
      title: entry.title,
      heading: entry.heading,
      headingId: entry.headingId,
      snippet: snippetAround(entry.text, terms),
      score,
    });
  }

  hits.sort((left, right) => right.score - left.score || left.title.localeCompare(right.title));
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.slug}#${hit.headingId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
};

export const DocsSearch = ({
  documents,
  onNavigate,
}: {
  documents: SearchDocument[];
  onNavigate: (slug: string, headingId?: string) => void;
}) => {
  const index = useMemo(() => buildIndex(documents), [documents]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchDocs(index, query), [index, query]);
  const listId = "docs-search-results";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setActive(0), [query]);

  const go = (hit: SearchHit) => {
    onNavigate(hit.slug, hit.headingId);
    setOpen(false);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (query) setQuery("");
      else inputRef.current?.blur();
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (value + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => (value - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(results[active] ?? results[0]);
    }
  };

  return (
    <div className="docs-search">
      <label className="docs-search-field">
        <span className="docs-search-label">Search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search the docs"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open && query.trim().length > 0}
          aria-controls={listId}
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        <kbd>/</kbd>
      </label>
      {open && query.trim() ? (
        <ul className="docs-search-results" id={listId} role="listbox">
          {results.length === 0 ? (
            <li className="docs-search-empty">No matches for "{query.trim()}".</li>
          ) : results.map((hit, index) => (
            <li key={`${hit.slug}-${hit.headingId}-${index}`} role="presentation">
              <button
                type="button"
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? "is-active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => go(hit)}
              >
                <strong>{hit.heading === hit.title ? hit.title : hit.heading}</strong>
                {hit.heading !== hit.title ? <span>{hit.title}</span> : null}
                <p dangerouslySetInnerHTML={{ __html: hit.snippet }} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
