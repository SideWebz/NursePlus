
const PORT = Deno.env.get("PORT") ? parseInt(Deno.env.get("PORT")!) : 8000;
const FRONTEND_DIR = `${Deno.cwd()}/frontend`;
const PUBLIC_DIR = `${Deno.cwd()}/public`;
const DEV = Deno.env.get("DEV_LIVERELOAD") === "1";

const routes: Record<string, string> = {
  "/": "home",
  "/home": "home",
  "/diensten": "diensten",
  "/contact": "contact",
  "/privacybeleid": "privacybeleid",
  "/algemene-voorwaarden": "algemene-voorwaarden",
  "/cookiepolicy": "cookiepolicy",
};

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const liveReloadSockets = new Set<WebSocket>();

Deno.serve({ port: PORT }, handleRequest);
console.log(`NursePlus running on http://localhost:${PORT}`);

async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return text("Method Not Allowed", 405);
  }

  const url = new URL(req.url);
  const pathname = normalize(url.pathname);

  if (DEV) console.log(`${req.method} ${pathname}`);

  if (DEV && pathname === "/__livereload") {
    if (req.headers.get("upgrade") === "websocket") return upgradeSocket(req);
    return text("Not Found", 404);
  }

  if (isStaticAsset(pathname)) {
    const relative = pathname.slice(1);
    if (await fileExists(`${FRONTEND_DIR}/${relative}`)) {
      return serveFile(FRONTEND_DIR, relative, req.method === "HEAD");
    }
    return serveFile(PUBLIC_DIR, relative, req.method === "HEAD");
  }

  const pageName = routes[pathname];
  if (!pageName) {
    return text(`Not Found: ${pathname}`, 404);
  }

  return assemblePage(pageName, req.method === "HEAD", req);
}

function normalize(raw: string): string {
  const pathname = decodeURIComponent(raw.split("?")[0] ?? raw);
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function isStaticAsset(pathname: string): boolean {
  return /\.(css|js|png|jpe?g|gif|svg|webp|ico)$/.test(pathname);
}

async function assemblePage(pageName: string, headOnly: boolean, req: Request): Promise<Response> {
  try {
    const [template, nav, footer, content, metaRaw] = await Promise.all([
      Deno.readTextFile(`${FRONTEND_DIR}/template.html`),
      Deno.readTextFile(`${FRONTEND_DIR}/partials/nav.html`),
      Deno.readTextFile(`${FRONTEND_DIR}/partials/footer.html`),
      Deno.readTextFile(`${FRONTEND_DIR}/pages/${pageName}.html`),
      Deno.readTextFile(`${FRONTEND_DIR}/meta/${pageName}.json`),
    ]);

    const meta = JSON.parse(metaRaw) as {
      title: string;
      description: string;
      keywords: string;
      robots: string;
      pageCSS?: string;
    };

    const pageCSSTag = meta.pageCSS ? `<link rel="stylesheet" href="${meta.pageCSS}" />` : "";
    const devScripts = DEV ? `<script src="/js/livereload.js"></script>` : "";
    const origin = new URL(req.url).origin;
    const ogImage = `${origin}/images/NursePlusCard.jpg`;
    const ogUrl = `${origin}${normalize(new URL(req.url).pathname)}`;

    const html = template
      .replaceAll("{{title}}", meta.title)
      .replaceAll("{{description}}", meta.description)
      .replaceAll("{{keywords}}", meta.keywords)
      .replaceAll("{{robots}}", meta.robots)
      .replaceAll("{{ogImage}}", ogImage)
      .replaceAll("{{ogUrl}}", ogUrl)
      .replaceAll("{{pageCSS}}", pageCSSTag)
      .replaceAll("{{devScripts}}", devScripts)
      .replaceAll("{{nav}}", nav)
      .replaceAll("{{content}}", content)
      .replaceAll("{{footer}}", footer);

    const headers: Record<string, string> = {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
    };

    return new Response(headOnly ? null : html, { status: 200, headers });
  } catch (error) {
    console.error(`Could not assemble page '${pageName}':`, error);
    return text(`Page not found: ${pageName}`, 404);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isFile;
  } catch {
    return false;
  }
}

async function serveFile(baseDir: string, relativePath: string, headOnly: boolean): Promise<Response> {
  if (relativePath.includes("..")) return text("Forbidden", 403);

  const filePath = `${baseDir}/${relativePath}`;
  try {
    const info = await Deno.stat(filePath);
    if (!info.isFile) return text("Not Found", 404);

    const ext = filePath.slice(filePath.lastIndexOf("."));
    const contentType = mime[ext] ?? "application/octet-stream";
    const cacheControl = DEV || ext === ".css" ? "no-store" : "public, max-age=86400";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    };

    return new Response(headOnly ? null : await Deno.readFile(filePath), { status: 200, headers });
  } catch {
    return text("Not Found", 404);
  }
}

function text(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

function upgradeSocket(req: Request): Response {
  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.onopen = () => liveReloadSockets.add(socket);
  socket.onclose = () => liveReloadSockets.delete(socket);
  socket.onerror = () => liveReloadSockets.delete(socket);
  return response;
}
