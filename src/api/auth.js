import { request } from './client'

export function register(data) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function login(data) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
