import { proxyRpc, readRequest } from '../scripts/rpc-proxy.mjs';
export default async function handler(request, response) {
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');
  if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Use POST for Studio Dev reads.' })); return; }
  try { response.end(JSON.stringify(await proxyRpc(request.body ?? await readRequest(request)))); }
  catch { response.statusCode = 400; response.end(JSON.stringify({ error: 'Invalid bounded RPC request.' })); }
}
