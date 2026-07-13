import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = join(root, ".next", "standalone");
const staticSource = join(root, ".next", "static");
const staticTarget = join(standaloneDir, ".next", "static");
const publicSource = join(root, "public");
const publicTarget = join(standaloneDir, "public");

if (!existsSync(join(standaloneDir, "server.js"))) {
  throw new Error("Standalone build not found. Run `npm run build` before `npm run start`.");
}

if (existsSync(staticSource)) {
  mkdirSync(dirname(staticTarget), { recursive: true });
  rmSync(staticTarget, { recursive: true, force: true });
  cpSync(staticSource, staticTarget, { recursive: true });
}

if (existsSync(publicSource)) {
  rmSync(publicTarget, { recursive: true, force: true });
  cpSync(publicSource, publicTarget, { recursive: true });
}
