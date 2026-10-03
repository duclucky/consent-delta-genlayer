import { proxyRpc, readRequest } from '../../scripts/rpc-proxy.mjs';
export default async function handler(request, response) {
  response.setHeader('content-type', 'application/json');
  response.setHeader('cache-control', 'no-store');
  if (request.method !== 'POST') { response.statusCode = 405; response.end(JSON.stringify({ error: 'Use POST for Studio Dev reads.' })); return; }
  try {
    let body = request.body ?? await readRequest(request);
    if (typeof body === 'string') body = JSON.parse(body);
    if (JSON.stringify(body).length > 32768) throw new Error('Request exceeds the supported bounds.');
    response.end(JSON.stringify(await proxyRpc(body)));
  }
  catch { response.statusCode = 400; response.end(JSON.stringify({ error: 'Invalid bounded RPC request.' })); }
}
