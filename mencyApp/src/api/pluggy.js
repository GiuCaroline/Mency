import { request } from './client';

export async function checkItems() {
  return request('/check-items', { method: 'GET' });
}

export async function getConnectToken() {
  return request('/connect-token', { method: 'GET' });
}

export async function saveItem({ itemId }) {
  return request('/items', { method: 'POST', body: { itemId } });
}

export async function deleteItems() {
  return request('/items', { method: 'DELETE' });
}

export async function listItems() {
  return request('/items', { method: 'GET' });
}

export async function listAccounts() {
  return request('/accounts', { method: 'GET' });
}

export async function getAccountTransactions(accountId, query = {}) {
  const params = new URLSearchParams();
  if (query.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query.dateTo) params.set('dateTo', query.dateTo);
  if (query.after) params.set('after', query.after);
  const q = params.toString() ? `?${params.toString()}` : '';
  return request(
    `/accounts/${encodeURIComponent(accountId)}/transactions${q}`,
    { method: 'GET' }
  );
}

export default {
  checkItems,
  getConnectToken,
  saveItem,
  deleteItems,
  listItems,
  listAccounts,
  getAccountTransactions,
};
