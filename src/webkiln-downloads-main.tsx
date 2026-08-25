import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./webkiln.css";
import WebkilnDownloads from "./components/WebkilnDownloads";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebkilnDownloads />
  </StrictMode>,
);
