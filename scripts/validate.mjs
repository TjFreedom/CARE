import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve('dist');
const origin = 'https://careestheticsdelaware.com';
const names = [...(await readdir(root)).filter(n=>n.endsWith('.html')), ...(await readdir(`${root}/services`)).filter(n=>n.endsWith('.html')).map(n=>`services/${n}`)];
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
const files = new Map(await Promise.all(names.map(async name=>[name,await readFile(`${root}/${name}`,'utf8')])));
const titles = new Set();
const descriptions = new Set();
let references = 0;
for (const [name,html] of files) {
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${name}: one H1`);
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert.ok(title && !titles.has(title),`${name}: unique title`); titles.add(title);
  const meta=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
  const description=meta.find(m=>m.name==='description')?.content;
  assert.ok(description && !descriptions.has(description),`${name}: unique description`); descriptions.add(description);
  const canonicals=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).filter(a=>a.rel==='canonical');
  const path=name==='index.html'?'/':`/${name.replace(/\.html$/,'')}`;
  assert.equal(canonicals.length,1,`${name}: one canonical`);
  assert.equal(canonicals[0].href,origin+path,`${name}: canonical matches route`);
  assert.equal(meta.find(m=>m.property==='og:url')?.content,origin+path,`${name}: social URL`);
  const isUtility=['404.html','thank-you.html'].includes(name);
  assert.equal(meta.some(m=>m.name==='robots'&&m.content.includes('noindex')),isUtility,`${name}: correct indexing`);
  assert.equal((html.match(/id="main-content"/g)||[]).length,1,`${name}: main landmark`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${name}: unique IDs`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const json=JSON.parse(match[1]);assert.ok(json['@graph'].some(n=>n['@id']===origin+'/#business'),`${name}: stable business identity`);
  }
  if(!isUtility) assert.ok(html.includes('application/ld+json'),`${name}: structured data`);
  for (const m of html.matchAll(/<(?:a|img|link|script)\b[^>]*>/g)) {
    const a=attrs(m[0]);const value=a.href||a.src;
    if(!value||value.startsWith('mailto:')||value.startsWith('tel:')||value.startsWith('data:')) continue;
    const u=new URL(value,origin+path);
    if(u.origin!==origin)continue;
    assert.ok(value.startsWith('/')||value.startsWith('#')||value.startsWith(origin),`${name}: root-relative reference ${value}`);
    let target=decodeURIComponent(u.pathname.slice(1))||'index.html';
    if(!target.split('/').at(-1).includes('.'))target+='.html';
    assert.ok(resolve(root,target).startsWith(root+'/'));
    await stat(resolve(root,target)).catch(()=>assert.fail(`${name}: missing ${value}`));
    if(u.hash && files.has(target))assert.ok(files.get(target).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),`${name}: missing anchor ${value}`);
    if(m[0].startsWith('<a') && !isUtility) assert.ok(!u.pathname.endsWith('.html'),`${name}: link uses canonical path ${value}`);
    if(m[0].startsWith('<img')) {
      assert.ok('alt' in a && a.width && a.height && a.srcset,`${name}: accessible, dimensioned responsive image`);
      for(const entry of a.srcset.split(','))await stat(root+entry.trim().split(' ')[0]);
    }
    references++;
  }
}
const sitemap=await readFile(`${root}/sitemap.xml`,'utf8');
const locs=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(locs.length,12);
assert.equal(new Set(locs).size,12);
for(const loc of locs) {
 assert.ok(loc.startsWith(origin+'/')&&!loc.includes('.html')&&!loc.includes('www.'));
 const name=loc===origin+'/'?'index.html':loc.slice(origin.length+1)+'.html';assert.ok(files.has(name));
}
assert.ok(!sitemap.includes('thank-you')&&!sitemap.includes('404'));
const form=files.get('contact.html').match(/<form[^>]*>/)?.[0]||'';
assert.ok(form.includes('data-netlify="true"')&&form.includes('method="POST"')&&form.includes('action="/thank-you"')&&form.includes('name="contact"'));
assert.ok(!form.includes('novalidate'));
const js=await readFile('js/main.js','utf8');assert.ok(!js.includes('contactForm.reset')&&!js.includes('Simulate form'));
const home=files.get('index.html');
const hero=home.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0]||'';
assert.ok(hero.includes('fetchpriority="high"')&&hero.includes('loading="eager"'));
const redirects=await readFile(`${root}/_redirects`,'utf8');
assert.ok(redirects.includes('/pages/services /services 301!'));
assert.ok(redirects.includes('/* /404.html 404'));
assert.ok(!redirects.includes('/services/* /services.html'));
console.log(`PASS: ${names.length} pages, ${locs.length} sitemap URLs, ${references} local references; metadata, links, schemas, responsive images, forms, and routing invariants.`);
