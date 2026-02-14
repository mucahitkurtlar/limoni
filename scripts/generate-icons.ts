#!/usr/bin/env bun

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const iconsDir = "icons";

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir);
}

const createSVG = (size: number) => {
  const padding = size * 0.15;
  const iconSize = size - padding * 2;
  const scale = iconSize / 24;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with Tailwind eksi.primary color -->
  <rect width="${size}" height="${size}" fill="#81c14b" rx="${size * 0.2}"/>
  
  <!-- Lucide Citrus Icon - centered and scaled -->
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <path d="M21.66 17.67a1.08 1.08 0 0 1-.04 1.6A12 12 0 0 1 4.73 2.38a1.1 1.1 0 0 1 1.61-.04z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.65 15.66A8 8 0 0 1 8.35 4.34" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="m14 10-5.5 5.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 17.85V10H6.15" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`.trim();
};

const sizes = [16, 32, 48, 96, 128];

sizes.forEach((size) => {
  const svg = createSVG(size);
  const filename = join(iconsDir, `limoni-${size}.svg`);
  writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log("\nIcons generated");
