import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { proxyRpc, readRequest } from '../scripts/rpc-proxy.mjs';

export default defineConfig({
  plugins: [react(), { name: 'studio-dev-read-proxy', configureServer(server) {
    server.middlewares.use('/genlayer-rpc', async (request, response) => {
      response.setHeader('content-type', 'application/json'); response.setHeader('cache-control', 'no-store');
      if (request.method !== 'POST') { response.statusCode = 405; response.end('{}'); return; }
      try { response.end(JSON.stringify(await proxyRpc(await readRequest(request)))); }
      catch { response.statusCode = 400; response.end(JSON.stringify({ error: 'Invalid RPC request.' })); }
    });
  } }],
  server: { port: 5177, strictPort: true },
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], restoreMocks: true },
});
