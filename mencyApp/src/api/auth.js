import { request } from './client';

export async function register({ name, email, cpf, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: { name, email, cpf, password },
  });
}

export async function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export async function refresh() {
  return request('/auth/refresh', { method: 'POST' });
}

export async function me() {
  return request('/auth/me', { method: 'GET' });
}

export async function deleteAccount() {
  return request('/auth/account', { method: 'DELETE' });
}

export default { register, login, logout, refresh, me, deleteAccount };
