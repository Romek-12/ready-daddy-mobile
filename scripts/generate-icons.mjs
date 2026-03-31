import sharp from '../node_modules/sharp/lib/index.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcPath = resolve(__dirname, '../../icon.png');
const assetsDir = resolve(__dirname, '../assets');

console.log('Generating icons from icon.png...');

const icons = [
  { name: 'icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
  { name: 'android-icon-foreground.png', size: 1024 },
];

for (const icon of icons) {
  await sharp(srcPath)
    .resize(icon.size, icon.size)
    .png()
    .toFile(resolve(assetsDir, icon.name));
  console.log(`✓ ${icon.name} (${icon.size}x${icon.size})`);
}

// Android background — extract dominant color from source icon
const { dominant } = await sharp(srcPath).stats();
await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: dominant.r, g: dominant.g, b: dominant.b, alpha: 1 },
  }
})
  .png()
  .toFile(resolve(assetsDir, 'android-icon-background.png'));
console.log(`✓ android-icon-background.png (dominant color rgb(${dominant.r},${dominant.g},${dominant.b}))`);

// Monochrome — greyscale silhouette
await sharp(srcPath)
  .resize(1024, 1024)
  .greyscale()
  .png()
  .toFile(resolve(assetsDir, 'android-icon-monochrome.png'));
console.log('✓ android-icon-monochrome.png');

console.log('\nWszystkie ikony wygenerowane!');
