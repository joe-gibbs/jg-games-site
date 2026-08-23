const icons: Record<string, string> = {
  html: "/webkiln/lang-icons/html.svg",
  xml: "/webkiln/lang-icons/html.svg",
  css: "/webkiln/lang-icons/css.svg",
  javascript: "/webkiln/lang-icons/javascript.svg",
  js: "/webkiln/lang-icons/javascript.svg",
  typescript: "/webkiln/lang-icons/typescript.svg",
  ts: "/webkiln/lang-icons/typescript.svg",
  cpp: "/webkiln/lang-icons/cpp.svg",
  c: "/webkiln/lang-icons/cpp.svg",
  h: "/webkiln/lang-icons/cpp.svg",
  hpp: "/webkiln/lang-icons/cpp.svg",
  cc: "/webkiln/lang-icons/cpp.svg",
  json: "/webkiln/lang-icons/json.svg",
};

const fromFileName = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export const LanguageIcon = ({
  language,
  fileName,
}: {
  language?: string;
  fileName?: string;
}) => {
  const src = icons[(language ?? fromFileName(fileName ?? "")).toLowerCase()];
  if (!src) return null;

  return <img className="lang-icon" src={src} alt="" width={14} height={14} />;
};
