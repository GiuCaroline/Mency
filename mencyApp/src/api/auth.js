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

export async function forgotPassword({ email }) {
  return request('/auth/forgotpassword', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPassword({ token, password }) {
  return request('/auth/resetpassword', {
    method: 'POST',
    body: { token, password },
  });
}

export default { register, login, logout, refresh, me, deleteAccount, forgotPassword, resetPassword };
