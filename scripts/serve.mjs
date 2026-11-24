import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const privateRoot = resolve(".private/originals");
const personal = process.env.MESHKAT_PERSONAL_PREVIEW === "1";
const root = resolve(personal ? ".private/out" : "out");
const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  try {
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (base) {
      if (pathname !== base && !pathname.startsWith(`${base}/`)) {
        res.writeHead(404);
        res.end();
        return;
      }
      pathname = pathname.slice(base.length) || "/";
    }
    let fileRoot = root;
    if (personal && pathname.startsWith("/images/originals/")) {
      fileRoot = privateRoot;
      pathname = pathname.slice("/images/originals".length);
      res.setHeader("Cache-Control", "no-store");
    }
    let file = resolve(fileRoot, `.${pathname}`);
    if (!file.startsWith(fileRoot + sep) && file !== fileRoot) {
      res.writeHead(403);
      res.end();
      return;
    }
    let info = await stat(file);
    if (info.isDirectory()) {
      file = resolve(file, "index.html");
      info = await stat(file);
    }
    if (!info.isFile()) throw new Error("Not a file");
    const type =
      pathname.replace(/\/$/, "") === "/api/content"
        ? "application/json; charset=utf-8"
        : types[extname(file)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Content-Length": info.size });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});
// Personal preview is intentionally bound to loopback only. Never expose or tunnel it.
server.listen(port, personal ? "127.0.0.1" : "0.0.0.0", () =>
  console.log(
    `MESHKAT ${personal ? "PRIVATE LOCAL PREVIEW" : "static preview"} listening on port ${port}`,
  ),
);
