import sharp from "sharp";
import fs from "fs";
import path from "path";

// The Concentrade logo as an SVG - purple gradient with bar chart motif
const svg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="22" fill="url(#bg)"/>
  <rect x="22" y="48" width="18" height="46" rx="3" fill="white" opacity="0.75"/>
  <rect x="44" y="30" width="18" height="64" rx="3" fill="white"/>
  <rect x="66" y="52" width="18" height="42" rx="3" fill="white" opacity="0.9"/>
  <rect x="88" y="38" width="18" height="56" rx="3" fill="white" opacity="0.8"/>
</svg>`;

async function generate() {
  const svgBuffer = Buffer.from(svg);

  // Generate 32x32 favicon.ico (PNG inside ICO format)
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join("app", "favicon.ico"), png32);
  console.log("Generated app/favicon.ico (32x32)");

  // Generate 192x192 icon for web manifest / general use
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join("public", "icon-192x192.png"), png192);
  console.log("Generated public/icon-192x192.png");

  // Generate 180x180 apple touch icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join("public", "apple-touch-icon.png"), png180);
  console.log("Generated public/apple-touch-icon.png");

  // Generate 512x512 icon for PWA
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join("public", "icon-512x512.png"), png512);
  console.log("Generated public/icon-512x512.png");

  console.log("All favicons generated successfully!");
}

generate().catch(console.error);
