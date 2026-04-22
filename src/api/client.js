const BASE_URL = '/api'

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Something went wrong')
  }

  return res.json()
}
