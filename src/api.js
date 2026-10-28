let token = sessionStorage.getItem('pontosat-token') || '';
export const auth = {
  get: () => token,
  set: (value) => {
    token = value;
    value
      ? sessionStorage.setItem('pontosat-token', value)
      : sessionStorage.removeItem('pontosat-token');
  },
};
export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v2${path}`, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const body = await response.json().catch(() => null);
    if (response.status === 401) {
      auth.set('');
      window.dispatchEvent(new Event('session-expired'));
    }
    if (!response.ok || body?.type === 'error')
      throw new Error(
        typeof body?.detail === 'string'
          ? body.detail
          : body?.message ||
              (response.status === 422
                ? 'Confira os campos informados.'
                : `Não foi possível concluir a solicitação (${response.status}).`),
      );
    return body;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError')
      throw new Error('O servidor demorou para responder. Tente novamente.');
    if (error instanceof TypeError)
      throw new Error('Não foi possível conectar à API. Verifique sua conexão e tente novamente.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export const json = (method, data) => ({
  method,
  body: JSON.stringify(data),
});
export function ticketQuery(search, status, offset) {
  const and = [];
  if (status) and.push({ column: 'status', op: 'eq', value: status });
  const query = new URLSearchParams({ offset: String(offset), limit: '10' });
  if (search || and.length)
    query.set(
      'filters',
      JSON.stringify({
        and,
        or: search
          ? [
              { column: 'title', op: 'ilike', value: search },
              { column: 'description', op: 'ilike', value: search },
            ]
          : [],
      }),
    );
  return query.toString();
}
