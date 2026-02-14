#!/usr/bin/env bun

import { build } from "bun";
import { existsSync, mkdirSync, cpSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const distDir = "dist";
const iconsDir = "icons";

if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

async function buildTailwindCSS() {
  try {
    await execAsync(
      "bunx tailwindcss -i ./src/popup/index.css -o ./dist/popup/index.css --minify"
    );
    console.log("Built popup index.css");

    await execAsync(
      "bunx tailwindcss -i ./src/content/index.css -o ./dist/content/index.css --minify"
    );
    console.log("Built content index.css");
  } catch (error) {
    console.error("Tailwind CSS build error:", error);
    process.exit(1);
  }
}

async function buildAll() {
  console.log("Building extension...\n");

  await buildTailwindCSS();

  try {
    await build({
      entrypoints: ["./src/background/index.ts"],
      outdir: join(distDir, "background"),
      naming: "[name].js",
      target: "browser",
      minify: true,
      sourcemap: "external",
    });
    console.log("Built background/index.js");

    await build({
      entrypoints: ["./src/content/index.ts"],
      outdir: join(distDir, "content"),
      naming: "[name].js",
      target: "browser",
      minify: true,
      sourcemap: "external",
    });
    console.log("Built content/index.js");

    await build({
      entrypoints: ["./src/popup/index.tsx"],
      outdir: join(distDir, "popup"),
      naming: "[name].js",
      target: "browser",
      minify: true,
      sourcemap: "external",
    });
    console.log("Built popup/index.js");

    const vendorCode = `
import React from 'react';
import ReactDOM from 'react-dom/client';
window.React = React;
window.ReactDOM = ReactDOM;
`;
    writeFileSync(join(distDir, "vendor-temp.js"), vendorCode);

    await build({
      entrypoints: [join(distDir, "vendor-temp.js")],
      outdir: distDir,
      naming: "vendor.js",
      target: "browser",
      minify: true,
    });
    console.log("Built vendor.js");

    unlinkSync(join(distDir, "vendor-temp.js"));
  } catch (error) {
    console.error("Build error:", error);
    process.exit(1);
  }

  try {
    if (existsSync("manifest.json")) {
      cpSync("manifest.json", join(distDir, "manifest.json"));
      console.log("Copied manifest.json");
    }

    if (existsSync(iconsDir)) {
      cpSync(iconsDir, join(distDir, iconsDir), { recursive: true });
      console.log("Copied icons/");
    }

    if (existsSync("src/popup/index.html")) {
      cpSync("src/popup/index.html", join(distDir, "popup/index.html"));
      console.log("Copied popup/index.html");
    }
  } catch (error) {
    console.error("Error copying files:", error);
    process.exit(1);
  }

  console.log("\nBuild complete!");
}

buildAll().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
