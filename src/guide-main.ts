import "./docs.css";
import "./guides.css";

for (const button of document.querySelectorAll<HTMLButtonElement>(".docs-code button[data-copy]")) {
  button.addEventListener("click", async () => {
    const code = button.closest(".docs-code")?.querySelector("pre code")?.textContent ?? "";
    await navigator.clipboard.writeText(code);
    button.textContent = "Copied";
    window.setTimeout(() => { button.textContent = "Copy"; }, 1400);
  });
}
