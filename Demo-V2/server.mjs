import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('.', import.meta.url));
const useDist = process.argv.includes('--dist');
const root = resolve(base, useDist ? 'dist' : '.');
const port = Number(process.env.PORT || 5400);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.woff':'font/woff', '.woff2':'font/woff2', '.wasm':'application/wasm' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method || '')) { res.writeHead(405); res.end(); return; }
  let path;
  try { path = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  if (path.split('/').some(part => part.startsWith('.'))) { res.writeHead(403); res.end('Not found'); return; }
  const monaco = path.startsWith('/vendor/monaco/');
  const directory = monaco ? (useDist ? resolve(root, 'vendor/monaco') : resolve(base, 'node_modules/monaco-editor/min')) : root;
  let file = resolve(directory, '.' + (monaco ? path.slice('/vendor/monaco'.length) : path));
  if (!file.startsWith(directory + sep) && file !== directory) { res.writeHead(403); res.end(); return; }
  if (!existsSync(file) || !statSync(file).isFile()) {
    if (monaco || extname(path)) { res.writeHead(404); res.end('Not found'); return; }
    file = resolve(root, 'index.html');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); }).pipe(res);
});
server.listen(port, '127.0.0.1', () => console.log(`Wizly Studio: http://127.0.0.1:${server.address().port}/admin\nLocal prototype only. Ctrl+C to stop.`));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
