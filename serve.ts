import { serve, file } from 'bun';
import { join } from 'path';

const PORT = 3000;

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // Default to examples/index.html
    if (path === '/') {
      path = '/examples/index.html';
    }

    const filePath = join(import.meta.dir, path);
    const f = file(filePath);

    if (await f.exists()) {
      return new Response(f);
    }

    return new Response('Not found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${PORT}`);
