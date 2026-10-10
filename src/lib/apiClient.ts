export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const MESSAGES = {
  network: "We couldn't reach the server. Check your internet connection and try again.",
  timeout: "This is taking too long. Check your connection and try again.",
  server: "Something went wrong on our side. Please try again in a moment.",
}

type Options = { headers?: Record<string, string>; timeoutMs?: number }

async function request<T>(method: "GET" | "POST", url: string, body: unknown, options: Options): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 25000)

  let status = 0
  let ok = false
  let text = ""

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
    status = res.status
    ok = res.ok
    // Read as text first: a dropped connection can leave an empty or partial body.
    text = await res.text()
  } catch (err: any) {
    throw new ApiError(err?.name === "AbortError" ? MESSAGES.timeout : MESSAGES.network)
  } finally {
    clearTimeout(timer)
  }

  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!ok) {
    throw new ApiError(
      data?.error || (status >= 500 ? MESSAGES.server : "Request failed. Please try again."),
      status
    )
  }
  if (data === null) throw new ApiError(MESSAGES.server, status)
  return data as T
}

export const postJson = <T = any>(url: string, body: unknown, options: Options = {}) =>
  request<T>("POST", url, body, options)

export const getJson = <T = any>(url: string, options: Options = {}) =>
  request<T>("GET", url, undefined, options)