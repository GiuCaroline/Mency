import { LogBox } from 'react-native';

const BASE_URL = 'https://pluggy-testes-iniciais.onrender.com/api';

// Suppress any console warnings during requests
LogBox.ignoreLogs(['Non-serializable values']);

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  console.log(`DEBUG  [api] request start`, {
    body,
    method,
    url: `${BASE_URL}${path}`,
  });

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    ...rest,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  console.log(`DEBUG  [api] response ok`, {
    ...data,
    status: res.status,
    url: `${BASE_URL}${path}`,
  });

  if (!res.ok) {
    const err = new Error((data && data.message) || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export { BASE_URL, request };
