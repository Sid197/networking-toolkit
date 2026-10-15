import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('public/sw.js', 'dist/sw.js');
