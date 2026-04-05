function normalizeApiBaseUrl(rawValue) {
  const fallback = 'http://localhost:5001/api/v1'

  if (!rawValue) {
    return fallback
  }

  const value = String(rawValue).trim()

  if (!value) {
    return fallback
  }

  if (value.startsWith(':')) {
    return `http://localhost${value}`
  }

  if (value.startsWith('//')) {
    return `http:${value}`
  }

  if (value.startsWith('/')) {
    return `http://localhost:5000${value}`
  }

  return value
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)

async function parseResponse(response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    signal
  } = options

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const requestHeaders = { ...headers }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (body !== undefined && !isFormData) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'message' in data
      ? data.message
      : `Request failed with status ${response.status}`

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export function getApiBaseUrl() {
  return API_BASE_URL
}