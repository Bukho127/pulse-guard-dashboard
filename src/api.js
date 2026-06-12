export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function parseResponse(response) {
  const text = await response.text()
  let data

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const message = data?.message || response.statusText || 'API request failed'
    throw new ApiError(message, response.status, data)
  }

  return data
}

function buildHeaders(token, json = true) {
  const headers = {}

  if (json) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  return parseResponse(response)
}



export async function loginPersonnel(payload) {
  const body = JSON.stringify(payload)
  console.log('Payload being sent:', payload)
  console.log('Stringified body:', body)

  return request('/police/login', {
    method: 'POST',
    headers: buildHeaders(null, true),
    body,
  })
}

export async function fetchIncidents(token) {
  console.log('fetchIncidents called with token:', token ? 'present' : 'missing')
  const headers = buildHeaders(token, false)
  console.log('fetchIncidents headers:', headers)

  try {
    const data = await request('/incidents', {
      method: 'GET',
      headers,
    })

    const incidents = Array.isArray(data)
      ? data
      : data?.incidents || data?.data?.incidents || data?.results || []

    return Array.isArray(incidents) ? incidents : []
  } catch (err) {
    console.error('fetchIncidents error:', err.status, err.message, err.payload)
    throw err
  }
}

export async function updateIncidentStatus(token, incidentId, status) {
  if (!incidentId) {
    throw new Error('Missing incident ID for status update.')
  }

  return request(`/incidents/${encodeURIComponent(incidentId)}/status`, {
    method: 'PUT',
    headers: buildHeaders(token, true),
    body: JSON.stringify({ status }),
  })
}

export async function fetchNotificationsCount(token) {
  const data = await request('/notifications/unread', {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  if (Array.isArray(data)) {
    return data.length
  }

  if (!data || typeof data !== 'object') {
    return 0
  }

  if (typeof data.count === 'number') {
    return data.count
  }

  if (typeof data.unreadCount === 'number') {
    return data.unreadCount
  }

  if (Array.isArray(data.notifications)) {
    return data.notifications.length
  }

  if (Array.isArray(data.data)) {
    return data.data.length
  }

  return 0
}

export async function fetchUnreadNotifications(token) {
  const data = await request('/notifications/unread', {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  if (Array.isArray(data)) {
    return {
      count: data.length,
      notifications: data,
    }
  }

  if (!data || typeof data !== 'object') {
    return {
      count: 0,
      notifications: [],
    }
  }

  const notifications =
    data.notifications ||
    data.data?.notifications ||
    data.data ||
    data.results ||
    []

  const count =
    data.count ||
    data.unreadCount ||
    data.data?.count ||
    data.data?.unreadCount ||
    (Array.isArray(notifications) ? notifications.length : 0)

  return {
    count,
    notifications: Array.isArray(notifications) ? notifications : [],
  }
}

export async function fetchHeatmapPoints(token, startDate, endDate) {
  const query = startDate && endDate ? `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}` : ''
  const data = await request(`/heatmap${query}`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  return data?.heatmap || data || []
}

export default {
  API_BASE_URL,
  loginPersonnel,
  fetchIncidents,
  fetchNotificationsCount,
  fetchUnreadNotifications,
  fetchHeatmapPoints,
}
