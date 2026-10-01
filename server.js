// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = process.env.PORT ? Number(process.env.PORT) : 3e3;
app.use(express.json());
var distPath = path.join(__dirname, "dist");
var indexPath = path.join(distPath, "index.html");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.get(["/health", "/_health", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "ok", service: "DonorConnect 4Care", uptime: process.uptime() });
});
app.get("*", (_req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send("<!doctype html><html><body><h3>DonorConnect 4Care - Loading Application...</h3></body></html>");
  }
});
var server = app.listen(port, "0.0.0.0", () => {
  console.log(`DonorConnect 4Care server listening on http://0.0.0.0:${port}`);
});
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
