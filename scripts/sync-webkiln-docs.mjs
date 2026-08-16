import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(siteRoot, "..", "Unreal Projects", "Webkiln", "Docs");
const destination = resolve(siteRoot, "src", "content", "webkiln");

const publicDocuments = [
  "README.md",
  "QuickStart.md",
  "Lifecycle.md",
  "Bridge.md",
  "API.md",
  "Input.md",
  "WorldSpace.md",
  "Settings.md",
  "Packaging.md",
  "Compatibility.md",
  "Diagnostics.md",
  "Troubleshooting.md",
  "SecurityAndSupport.md",
  "CppAPI.md",
];

const internalDocuments = [
  "EngineIntegrationArchitecture.md",
  "ReleaseChecklist.md",
  "WebkilnWin64CommercialPluginPlan.md",
];

await mkdir(destination, { recursive: true });
await Promise.all(publicDocuments.map((name) =>
  copyFile(resolve(source, name), resolve(destination, name)),
));
await Promise.all(internalDocuments.map((name) =>
  rm(resolve(destination, name), { force: true }),
));

console.log(`Mirrored ${publicDocuments.length} public Webkiln documents.`);
