import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./docs.css";
import WebkilnDocs from "./WebkilnDocs";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WebkilnDocs />
  </StrictMode>,
);
