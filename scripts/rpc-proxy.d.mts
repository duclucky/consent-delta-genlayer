import type { IncomingMessage } from 'node:http';
export const STUDIO_RPC: string;
export function proxyRpc(body: unknown, upstream?: typeof fetch): Promise<unknown>;
export function readRequest(request: IncomingMessage): Promise<unknown>;
