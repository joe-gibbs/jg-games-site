import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./webkiln.css";
import WebkilnMarketing from "./WebkilnMarketing";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebkilnMarketing />
  </StrictMode>,
);
