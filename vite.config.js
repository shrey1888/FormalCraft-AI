import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { generateDocument } from "./src/lib/generator.js";

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
    }),
    {
      name: "api-generate-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, "http://localhost:3000");
          if (url.pathname === "/api/generate" && req.method === "POST") {
            try {
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const bodyStr = Buffer.concat(chunks).toString("utf8");
              const body = JSON.parse(bodyStr || "{}");
                const {
                  bullets,
                  tone = "formal",
                  length = "medium",
                  letterType = "business",
                  recipient = "",
                  subject = "",
                } = body;

                if (!bullets || !bullets.trim()) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  res.end(
                    JSON.stringify({
                      error:
                        "Please provide bullet points or key details to compose your document.",
                    })
                  );
                  return;
                }

                const result = await generateDocument({
                  bullets,
                  tone,
                  length,
                  letterType,
                  recipient,
                  subject,
                });

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(result));
                return;
            } catch (err) {
              console.error("API error:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: "An unexpected error occurred while generating the document.",
                })
              );
              return;
            }
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "next/link": path.resolve(process.cwd(), "./src/lib/next-link-stub.jsx"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
  },
});
