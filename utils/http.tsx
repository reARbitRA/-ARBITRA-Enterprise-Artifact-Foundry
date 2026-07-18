import { AppError } from '../types';

type Decoder<T> = (input: unknown) => T;

export class HttpError extends Error implements AppError {
  code: string;
  status: number;
  url: string;
  body?: unknown;
  meta?: Record<string, unknown>;
  cause?: unknown;

  constructor(params: {
    message?: string;
    code?: string;
    status: number;
    url: string;
    body?: unknown;
    cause?: unknown;
    meta?: Record<string, unknown>;
  }) {
    super(params.message ?? `HTTP Error ${params.status}`);
    this.name = 'HttpError';
    this.code = params.code ?? 'HTTP_ERROR';
    this.status = params.status;
    this.url = params.url;
    this.body = params.body;
    this.cause = params.cause;
    this.meta = params.meta;
  }
}

export type FetchJsonOptions<T = unknown> = Omit<RequestInit, 'signal'> & {
  signal?: AbortSignal;
  timeoutMs?: number;
  decoder?: Decoder<T>;
  headers?: HeadersInit;
};

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function mergeHeaders(a?: HeadersInit, b?: HeadersInit): HeadersInit {
  const h = new Headers(a ?? {});
  const bH = new Headers(b ?? {});
  bH.forEach((v, k) => h.set(k, v));
  return h;
}

function linkAbortSignals(external?: AbortSignal) {
  const controller = new AbortController();
  const { signal } = controller;
  if (external) {
    if (external.aborted) controller.abort(external.reason);
    const onAbort = () => controller.abort(external.reason);
    external.addEventListener('abort', onAbort, { once: true });
    return { controller, signal, cleanup: () => external.removeEventListener('abort', onAbort) };
  }
  return { controller, signal, cleanup: () => {} };
}

/**
 * fetch JSON امن با timeout, abort, و decoder اختیاری
 */
export async function httpJson<T>(
  input: RequestInfo | URL,
  options: FetchJsonOptions<T> = {}
): Promise<T> {
  const { decoder, timeoutMs = 25_000, signal: externalSignal, headers, ...init } = options;

  const { controller, signal, cleanup } = linkAbortSignals(externalSignal);

  const timeout = timeoutMs > 0 ? setTimeout(() => controller.abort('timeout'), timeoutMs) : undefined;

  try {
    const finalHeaders = (() => {
      const base = mergeHeaders(
        { Accept: 'application/json' },
        headers
      );
      // اگر body فرم‌دیتا باشد، Content-Type را ست نکن
      if (!isFormData(init.body) && !(base instanceof Headers && base.has('Content-Type'))) {
        (base as Headers).set('Content-Type', 'application/json');
      }
      return base;
    })();

    const res = await fetch(input, {
      credentials: 'same-origin',
      ...init,
      headers: finalHeaders,
      signal,
    });

    const url = typeof input === 'string' ? input : input.toString();

    const parseBodySafe = async () => {
      const text = await res.text();
      if (!text) return undefined;
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    };

    if (!res.ok) {
      const body = await parseBodySafe();
      throw new HttpError({
        status: res.status,
        url,
        body,
        code: 'HTTP_' + res.status,
        message: (body as any)?.message ?? `Request failed with status ${res.status}`,
      });
    }

    // 204-No Content
    if (res.status === 204) return undefined as unknown as T;

    const dataRaw = await parseBodySafe();
    const data = decoder ? decoder(dataRaw) : (dataRaw as T);
    return data;
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.message === 'timeout') {
      throw new HttpError({
        status: 499,
        url: typeof input === 'string' ? input : input.toString(),
        code: 'HTTP_TIMEOUT_OR_ABORT',
        message: 'Request was aborted or timed out',
        cause: err,
      });
    }
    if (err instanceof HttpError) throw err;
    throw new HttpError({
      status: 500,
      url: typeof input === 'string' ? input : input.toString(),
      code: 'HTTP_UNKNOWN',
      message: err?.message ?? 'Unknown network error',
      cause: err,
    });
  } finally {
    cleanup();
    if (timeout) clearTimeout(timeout);
  }
}