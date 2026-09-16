// Optional per-module minification. Paths remain stable for native workers and SW precaching.
import { transform } from 'esbuild';
import { readdir, readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
await rm(dist, { recursive:true, force:true });
await mkdir(dist, { recursive:true });
const manifest = JSON.parse(await readFile(path.join(root, 'source-manifest.json'), 'utf8'));
for (const relative of manifest.files) {
  const destination = path.join(dist, relative); await mkdir(path.dirname(destination), { recursive:true });
  if (relative.endsWith('.js') && (relative.startsWith('js/') || relative === 'sw.js')) {
    const source = await readFile(path.join(root, relative), 'utf8');
    const output = await transform(source, { loader:'js', minify:true, target:'es2022', sourcemap:false });
    await writeFile(destination, output.code);
  } else await cp(path.join(root, relative), destination);
}
console.log(`Static build complete: ${manifest.files.length} files in dist/. Native module and worker paths preserved.`);
console.log('Open dev/harness.html through a static server to run browser tests. No typecheck or Lighthouse claim is made by this build.');
