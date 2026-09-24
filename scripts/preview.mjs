// Local static preview; this is not a Netlify Forms backend.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve('dist');
const routes=(await readFile(`${root}/_redirects`,'utf8')).split('\n').filter(l=>l.startsWith('/')&&!l.startsWith('/*')).map(l=>l.trim().split(/\s+/));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon','.xml':'application/xml','.txt':'text/plain'};
createServer(async (req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Content-Type':'text/plain'});return res.end('Form submission requires the deployed Netlify site.');}
 const url=new URL(req.url,'http://localhost');let path=decodeURIComponent(url.pathname);let status=200;
 const route=routes.find(r=>r[0]===path);
 if(route){
  if(route[2].startsWith('301')) {res.writeHead(301,{Location:route[1]+url.search});return res.end();}
  path=route[1];
 }
 if(path==='/')path='/index.html';
 let file=resolve(root,'.'+path);
 if(!file.startsWith(root+'/')){res.writeHead(403);return res.end();}
 try{if(!(await stat(file)).isFile())throw Error();}catch{file=resolve(root,'404.html');status=404;}
 const data=await readFile(file);res.writeHead(status,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
}).listen(4173,'127.0.0.1',()=>console.log('Care preview: http://127.0.0.1:4173'));
