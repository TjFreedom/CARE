// Dependency-free static build. Keep source, docs, and tests out of the deployment.
import { mkdir, readFile, writeFile, cp, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const css = await readFile('css/style.css');
const js = await readFile('js/main.js');
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 12);
const cssPath = `css/style.${hash(css)}.css`;
const jsPath = `js/main.${hash(js)}.js`;
for (const folder of ['css','js','services']) await mkdir(join(out,folder),{recursive:true});
await writeFile(join(out,cssPath),css);
await writeFile(join(out,jsPath),js);
const pageNames = (await readdir('.')).filter(name=>name.endsWith('.html'));
for (const name of await readdir('services')) if (name.endsWith('.html')) pageNames.push(`services/${name}`);
for (const name of pageNames) {
  let html = await readFile(name,'utf8');
  html = html.replaceAll('/css/style.css', `/${cssPath}`).replaceAll('/js/main.js', `/${jsPath}`);
  // Preview deployments should be reviewable but not indexed by search engines.
  if (process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy') {
    html = html.replace(/<meta\s+[^>]*name=["']robots["'][^>]*>/g, '');
    html = html.replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>');
  }
  await writeFile(join(out,name),html);
}
await cp('assets/optimized',join(out,'assets/optimized'),{recursive:true});
await cp('assets/og-image.png',join(out,'assets/og-image.png'));
for (const name of (await readdir('.')).filter(name=>name.startsWith('favicon')||['robots.txt','sitemap.xml','_redirects'].includes(name))) await cp(name,join(out,name));
console.log(`Built ${pageNames.length} pages with fingerprinted CSS, JavaScript, and optimized images.`);
