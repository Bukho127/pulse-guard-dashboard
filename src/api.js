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

/**
 * Fetch all heatmap data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Heatmap data with H3 hexagon features and metadata
 */
export async function fetchHeatmapPoints(token) {
  const data = await request('/heatmap', {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  // Handle response format
  if (data?.type === 'heatmap' && data?.features) {
    return data
  }

  // Backward compatibility for old format
  return data?.heatmap || data || { features: [], metadata: {} }
}

/**
 * Fetch heatmap data for a specific month
 * @param {string} token - Authentication token
 * @param {string} month - Month in YYYY-MM format (e.g., "2026-06")
 * @returns {Promise<Object>} Heatmap data with H3 hexagon features
 */
export async function fetchHeatmapByMonth(token, month) {
  if (!month || !month.match(/^\d{4}-\d{2}$/)) {
    throw new Error('Invalid month format. Use YYYY-MM')
  }

  const query = `?month=${encodeURIComponent(month)}`
  const data = await request(`/heatmap/month${query}`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  // Handle response format
  if (data?.type === 'heatmap' && data?.features) {
    return data
  }

  // Backward compatibility
  return data?.heatmap || data || { features: [], metadata: {} }
}

/**
 * Fetch heatmap data for a date range
 * @param {string} token - Authentication token
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Heatmap data with H3 hexagon features
 */
export async function fetchHeatmapByDateRange(token, startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('startDate and endDate are required (YYYY-MM-DD format)')
  }

  const query = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  const data = await request(`/heatmap/range${query}`, {
    method: 'GET',
    headers: buildHeaders(token, false),
  })

  // Handle response format
  if (data?.type === 'heatmap' && data?.features) {
    return data
  }

  // Backward compatibility
  return data?.heatmap || data || { features: [], metadata: {} }
}

export default {
  API_BASE_URL,
  loginPersonnel,
  fetchIncidents,
  fetchNotificationsCount,
  fetchUnreadNotifications,
  fetchHeatmapPoints,
  fetchHeatmapByMonth,
  fetchHeatmapByDateRange,
}