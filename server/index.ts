import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Add debugging endpoints in production
  if (app.get("env") === "production") {
    app.get("/debug/paths", (_req, res) => {
      const possiblePaths = [
        path.resolve("/app/dist/public"),
        path.resolve(process.cwd(), "dist/public"),
        path.resolve(import.meta.dirname, "../dist/public"),
        path.resolve(import.meta.dirname, "public")
      ];
      
      const results: Record<string, any> = {};
      for (const p of possiblePaths) {
        try {
          results[p] = {
            exists: fs.existsSync(p),
            isDirectory: fs.existsSync(p) ? fs.statSync(p).isDirectory() : false,
            files: fs.existsSync(p) && fs.statSync(p).isDirectory() ? 
              fs.readdirSync(p).slice(0, 20) : []
          };
        } catch (err: any) {
          results[p] = { error: err.message };
        }
      }
      
      res.json({
        cwd: process.cwd(),
        import_meta_dirname: import.meta.dirname,
        NODE_ENV: process.env.NODE_ENV,
        paths: results
      });
    });
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve static files directly
    const possibleDistPaths = [
      path.resolve("/app/dist/public"),
      path.resolve(process.cwd(), "dist/public"),
      path.resolve(import.meta.dirname, "../dist/public")
    ];
    
    let distPath = null;
    for (const p of possibleDistPaths) {
      if (fs.existsSync(p)) {
        distPath = p;
        log(`Found static files at: ${distPath}`);
        break;
      }
    }
    
    if (!distPath) {
      log(`ERROR: Could not find static files. Tried: ${possibleDistPaths.join(', ')}`);
      app.use("*", (_req, res) => {
        res.status(500).send(`
          <html>
            <head><title>Server Error</title></head>
            <body>
              <h1>Server Error</h1>
              <p>Could not find static files directory.</p>
              <p>Please check server logs for more information.</p>
              <p><a href="/debug/paths">View debug information</a></p>
            </body>
          </html>
        `);
      });
    } else {
      // Serve static files with caching headers
      log(`Serving static files from ${distPath}`);
      app.use(express.static(distPath, {
        maxAge: '1d',
        etag: true
      }));
      
      // Fall through to index.html for client-side routing
      app.use("*", (req, res) => {
        log(`Serving index.html for path: ${req.originalUrl}`);
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
