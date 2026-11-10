import { safeFetchJson } from './safeFetch';

export interface MemoryRecord {
  scope: string;
  payload: Record<string, any>;
}

/**
 * Salva qualquer dado na Memória Sovereign da vpsNsA.
 * O dado viverá por exatamente 2 anos antes da purga autônoma.
 */
export async function storeSovereignMemory(scope: string, data: Record<string, any>) {
  const response = await safeFetchJson('/api/memory/store', {
    method: 'POST',
    body: JSON.stringify({
      data_scope: scope,
      payload: data,
      ttl_years: 2
    }),
    retries: 3,
    timeoutMs: 5000
  });

  return response;
}
