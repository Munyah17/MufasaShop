import fs from "fs";
import path from "path";

export function logError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? "") : "";

  const entry = [
    `[${timestamp}] ERROR — ${context}`,
    `Message: ${message}`,
    meta ? `Meta: ${JSON.stringify(meta, null, 2)}` : null,
    stack ? `Stack:\n${stack}` : null,
    "─".repeat(60),
  ]
    .filter(Boolean)
    .join("\n") + "\n";

  // console.error is always captured — Vercel function logs, PM2, systemd, etc.
  console.error(entry);

  // Write to file when filesystem is writable (local dev / VPS / self-hosted)
  try {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, "errors.log"), entry, "utf8");
  } catch {
    // Silently skip on read-only filesystems (Vercel serverless)
  }
}
