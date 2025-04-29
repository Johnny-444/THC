import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In Docker container, the files are always in /app/dist
  const possiblePaths = [
    path.resolve("/app/dist/public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(import.meta.dirname, "../dist/public"),
    path.resolve(import.meta.dirname, "public")
  ];
  
  let distPath = null;
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        // Check if index.html exists in this path
        const indexPath = path.join(p, "index.html");
        if (fs.existsSync(indexPath)) {
          distPath = p;
          log(`Found static files at: ${distPath} with index.html`);
          break;
        } else {
          log(`Found directory at ${p} but no index.html file`);
        }
      }
    } catch (err: any) {
      log(`Error checking path ${p}: ${err.message}`);
    }
  }

  if (!distPath) {
    const error = `Could not find static files. Tried: ${possiblePaths.join(', ')}`;
    log(error);
    
    // Instead of throwing, create a simple fallback response
    app.use("*", (_req: Request, res: Response) => {
      res.status(500).send(`
        <html>
          <head><title>Server Error</title></head>
          <body>
            <h1>Server Error</h1>
            <p>${error}</p>
            <p>Environment: ${process.env.NODE_ENV || 'unknown'}</p>
            <p>Current working directory: ${process.cwd()}</p>
          </body>
        </html>
      `);
    });
    return;
  }

  // Serve static files with proper caching headers
  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true
  }));

  // Log all requests in production to help with debugging
  if (process.env.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      log(`Static file request: ${req.method} ${req.path}`);
      next();
    });
  }

  // Fall through to index.html for client-side routing
  app.use("*", (req: Request, res: Response) => {
    log(`Serving index.html for path: ${req.originalUrl}`);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
