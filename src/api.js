export const auth = {
  get() {
    return sessionStorage.getItem("pontosat-token") || "";
  },
  set(value) {
    if (value) {
      sessionStorage.setItem("pontosat-token", value);
    } else {
      sessionStorage.removeItem("pontosat-token");
    }
  },
};

export function errorMessage(body, status) {
  if (typeof body?.detail === "string") {
    return body.detail;
  }
  if (Array.isArray(body?.detail)) {
    const messages = [];
    for (const item of body.detail) {
      const field = item.loc?.slice(1).join(".") || "Campo";
      messages.push(field + ": " + item.msg);
    }
    return messages.join(" · ");
  }
  return (
    body?.message || `Não foi possível concluir a solicitação (${status}).`
  );
}

export async function request(path, { method = "GET", data, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const abort = () => controller.abort();
  if (signal?.aborted) {
    controller.abort();
  }
  signal?.addEventListener("abort", abort, { once: true });
  try {
    const token = auth.get();
    const options = { method, signal: controller.signal, headers: {} };
    if (token) {
      options.headers.Authorization = "Bearer " + token;
    }
    if (data !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const response = await fetch(baseUrl + "/api/v2" + path, options);
    const body = await response.json().catch(() => null);
    if (response.status === 401 && path !== "/login") {
      auth.set("");
      window.dispatchEvent(new Event("session-expired"));
    }
    if (!response.ok || body?.type === "error") {
      throw new Error(errorMessage(body, response.status));
    }
    return body;
  } catch (error) {
    if (error.name === "AbortError" && !signal?.aborted) {
      throw new Error("O servidor demorou para responder. Tente novamente.");
    }
    if (error instanceof TypeError) {
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

export function first(data) {
  if (Array.isArray(data)) {
    return data[0];
  }
  return data;
}
export function ticketQuery({ search = "", status = "", page = 0 }) {
  const query = new URLSearchParams({ limit: "10", offset: String(page * 10) });
  const and = [];
  const or = [];
  if (status) {
    and.push({ column: "status", op: "eq", value: status });
  }
  if (search) {
    or.push({ column: "title", op: "ilike", value: search });
    or.push({ column: "description", op: "ilike", value: search });
  }
  if (and.length > 0 || or.length > 0) {
    query.set("filters", JSON.stringify({ and, or }));
  }
  return query.toString();
}

export async function allUsers(signal) {
  const users = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const response = await request(`/users?limit=100&offset=${offset}`, {
      signal,
    });
    users.push(...(response.data || []));
    hasMore = !(
      !response.data?.length ||
      users.length >= response.meta?.total ||
      response.data.length < 100
    );
    offset += 100;
  }
  return users;
}
