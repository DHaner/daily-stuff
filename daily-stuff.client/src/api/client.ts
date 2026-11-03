export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: init.method ?? 'GET',
    headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as { detail?: string; title?: string } | null;
    throw new ApiError(problem?.detail ?? problem?.title ?? 'No se pudo completar la solicitud', response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
