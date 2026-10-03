export function safeReceipt(input: unknown): {
  hash?: string; status: string; execution?: string; finalized: boolean; successful: boolean; failed: boolean;
};
