import { Platform } from 'react-native';

/**
 * Base URL of the daily-stuff API (the nginx container in the homelab, which proxies `/api`).
 * Set `EXPO_PUBLIC_API_URL` in `.env.local`; `localhost` only works on web and the iOS simulator
 * (the Android emulator reaches the host at `10.0.2.2`).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function send(path: string, init: RequestInit): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api${path}`, init);
  } catch {
    throw new ApiError(`No se pudo conectar con el servidor (${API_URL})`, 0);
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      detail?: string;
      title?: string;
    } | null;

    throw new ApiError(
      problem?.detail ?? problem?.title ?? 'No se pudo completar la solicitud',
      response.status
    );
  }

  return response;
}

export async function api<T>(
  path: string,
  init: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown } = {}
): Promise<T> {
  const response = await send(path, {
    method: init.method ?? 'GET',
    headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Like `api`, but a 404 resolves to `null` (for "get one" endpoints where absence is normal). */
export async function apiOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export function guessMimeType(name: string) {
  const extension = name.split('?')[0].split('.').pop()?.toLowerCase() ?? '';

  return MIME_TYPES[extension] ?? 'application/octet-stream';
}

/** Uploads a local file (a picker URI) as the `file` part of a multipart PUT. */
export async function uploadFile<T>(
  path: string,
  file: { uri: string; name: string; type: string }
): Promise<T> {
  const form = new FormData();

  if (Platform.OS === 'web') {
    form.append('file', await (await fetch(file.uri)).blob(), file.name);
  } else {
    // React Native's FormData reads `{ uri, name, type }` straight from disk.
    form.append('file', file as unknown as Blob);
  }

  // No Content-Type header: fetch adds the multipart boundary itself.
  const response = await send(path, { method: 'PUT', body: form });

  return (await response.json()) as T;
}

/** True for a URI that points at the API, as opposed to a freshly picked local file. */
export const isRemoteUri = (uri: string) => uri.startsWith(`${API_URL}/`);
