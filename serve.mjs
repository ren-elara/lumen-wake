import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const root=fileURLToPath(new URL('./game/',import.meta.url));
const port=Number(process.env.PORT||8080);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
  try{const path=decodeURIComponent(new URL(req.url||'/','http://local').pathname);const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root.endsWith(sep)?root:root+sep))throw Error('Forbidden');if(!(await stat(file)).isFile())throw Error('Not found');res.writeHead(200,{'Content-Type':(mime[extname(file)]||'application/octet-stream')+'; charset=utf-8','Cache-Control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Lumen Wake: http://127.0.0.1:${port}`));
