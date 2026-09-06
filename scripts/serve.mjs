/**
 * 依存パッケージなしの静的ファイルサーバ。
 * ES モジュールを fetch するため、file:// ではなくこのサーバ経由で開く。
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT ?? 8000);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

async function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const safe = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  let target = join(root, safe);
  const info = await stat(target).catch(() => null);
  if (info?.isDirectory()) target = join(target, 'index.html');
  return target;
}

createServer(async (request, response) => {
  const target = await resolvePath(request.url ?? '/');
  const info = await stat(target).catch(() => null);

  if (!info?.isFile() || !target.startsWith(root)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
    return;
  }

  response.writeHead(200, {
    'content-type': CONTENT_TYPES[extname(target)] ?? 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  createReadStream(target).pipe(response);
}).listen(port, () => {
  console.log(`http://localhost:${port}/ で配信中（Ctrl+C で停止）`);
});
