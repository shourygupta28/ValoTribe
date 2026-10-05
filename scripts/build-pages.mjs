import {mkdir, readFile, writeFile, cp} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, '.pages-build');
// configure-pages supplies the path for both repository sites and custom domains.
const basePath = (process.env.PAGES_BASE_PATH ?? '/ValoTribe').replace(/\/$/, '');
if (basePath && !/^\/[A-Za-z0-9._/-]+$/.test(basePath)) {
  throw new Error('PAGES_BASE_PATH must be empty or a URL path beginning with /');
}
const files = [
  'app/layout.tsx', 'app/globals.css', 'app/live.css', 'app/icon.svg',
  'app/site-info.tsx', 'app/demo/page.tsx', 'app/demo/preview.tsx',
  'app/demo/login-dashboard.tsx',
  'app/review/page.tsx', 'app/privacy/page.tsx', 'app/terms/page.tsx',
  'lib/compatibility.mjs', 'lib/pages-demo.mjs',
];
// An explicit allowlist keeps API routes, database code and .env files out of Pages.
for (const file of files) {
  let source = await readFile(path.join(root, file), 'utf8');
  if (file.endsWith('.tsx')) {
    source = source.replace(/export const dynamic='force-dynamic';\r?\n/g, '');
    source = source.replace(/href="\/(.*?)"/g, (_, route) =>
      `href="${basePath}/${route}${route && !route.endsWith('/') ? '/' : ''}"`);
  }
  if (file === 'app/site-info.tsx') {
    source = source.replace('<footer className="global-footer">',
      '<footer className="global-footer"><p className="notice">Static fictional demo. Demo login and dashboard changes run only in your browser. Real accounts, email and live LFG are unavailable here. The policies describe the server app.</p>');
  }
  const target = path.join(destination, file);
  await mkdir(path.dirname(target), {recursive: true});
  await writeFile(target, source);
}
await writeFile(path.join(destination, 'lib/config.ts'),
  "export function operator(){return {name:'',email:''}}\nexport function signupReady(){return false}\n");
await writeFile(path.join(destination, 'app/page.tsx'),
  "import LoginDashboard from './demo/login-dashboard';\nexport default function Page(){return <LoginDashboard/>}\n");
await writeFile(path.join(destination, 'next.config.mjs'),
  `export default {output:'export',basePath:${JSON.stringify(basePath)},trailingSlash:true,poweredByHeader:false,images:{unoptimized:true}};\n`);
const tsconfig = JSON.parse(await readFile(path.join(root, 'tsconfig.json'), 'utf8'));
tsconfig.compilerOptions.incremental = false;
await writeFile(path.join(destination, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
await writeFile(path.join(destination, 'package.json'), JSON.stringify({name:'valotribe-pages',private:true}));
// Public ownership-verification files are also safe to publish when provided.
try {await cp(path.join(root, 'public'), path.join(destination, 'public'), {recursive:true});}
catch (error) {if (error.code !== 'ENOENT') throw error;}
const result = spawnSync(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'build', destination], {
  cwd: root, stdio: 'inherit', env: {...process.env, NEXT_TELEMETRY_DISABLED:'1'},
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
await writeFile(path.join(destination, 'out/.nojekyll'), '');
console.log(`Pages output: ${path.join(destination, 'out')} (base path: ${basePath || '/'})`);
