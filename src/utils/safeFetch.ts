/**
 * vpsNsA Sovereign Cloud — Cliente HTTP Resiliente (safeFetch)
 * Funcionalidades: Timeout configurável com AbortController, Retentativas com Backoff Exponencial,
 * Tratamento de erros HTTP, e Fallback Gracioso.
 * Diretrizes: vpsNsA — Level 5 Full Root
 */

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  backoffFactor?: number;
  fallbackData?: any;
}

export interface SafeFetchResponse<T> {
  data: T | null;
  ok: boolean;
  status: number;
  statusText: string;
  error?: string;
  isFallback: boolean;
  latencyMs: number;
}

/**
 * Executa chamadas HTTP seguras com garantia de não travamento da interface.
 */
export async function safeFetch<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse<T>> {
  const {
    timeoutMs = 6000,
    retries = 2,
    backoffFactor = 1.5,
    fallbackData = null,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let delay = 300;
  let lastError: any = null;
  const startTime = performance.now();

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        // Se for erro de servidor 5xx ou 429 (rate-limit), tenta novamente se houver tentativas restantes
        if ((response.status >= 500 || response.status === 429) && attempt < retries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= backoffFactor;
          continue;
        }

        // Tenta obter mensagem de erro json
        let errDetails = response.statusText;
        try {
          const errBody = await response.json();
          if (errBody?.error || errBody?.message) {
            errDetails = errBody.error || errBody.message;
          }
        } catch {
          // ignore
        }

        return {
          data: fallbackData,
          ok: false,
          status: response.status,
          statusText: response.statusText,
          error: errDetails,
          isFallback: fallbackData !== null,
          latencyMs,
        };
      }

      // Sucesso na resposta
      const contentType = response.headers.get('content-type') || '';
      let parsedData: T;

      if (contentType.includes('application/json')) {
        parsedData = await response.json();
      } else {
        parsedData = (await response.text()) as unknown as T;
      }

      return {
        data: parsedData,
        ok: true,
        status: response.status,
        statusText: response.statusText,
        isFallback: false,
        latencyMs,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (attempt < retries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffFactor;
      } else {
        break;
      }
    }
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const errorMessage =
    lastError?.name === 'AbortError'
      ? `Timeout de ${timeoutMs}ms excedido na requisição`
      : lastError?.message || 'Falha de conexão com o servidor';

  return {
    data: fallbackData,
    ok: false,
    status: 0,
    statusText: 'CLIENT_ERROR',
    error: errorMessage,
    isFallback: fallbackData !== null,
    latencyMs,
  };
}

/**
 * Executa chamadas seguras e retorna diretamente o payload JSON ou lança erro estruturado.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  const result = await safeFetch<T>(url, {
    ...options,
    headers,
  });

  if (!result.ok) {
    throw new Error(result.error || `HTTP ${result.status} ${result.statusText}`);
  }

  return result.data as T;
}

