// Cliente HTTP do app. A sessão vive em cookies HttpOnly guardados pela camada
// de rede nativa (o JS não lê nem guarda tokens). Ver docs/INTEGRACAO.md do backend.

// Em desenvolvimento dá para apontar para o backend local com EXPO_PUBLIC_API_URL
// (ex.: http://10.0.2.2:3000/api no emulador Android, http://<IP-do-PC>:3000/api no celular).
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://pluggy-testes-iniciais.onrender.com/api')
  .replace(/\/+$/, '');

// Fora do modo de desenvolvimento, só aceitamos HTTPS: cookies de sessão e dados
// financeiros nunca trafegam sem TLS.
const CONEXAO_SEGURA = __DEV__ || BASE_URL.startsWith('https://');

const TIMEOUT_PADRAO = 30000;

let renovando = null;          // um único refresh por vez (o refresh token é rotativo)
let aoExpirarSessao = null;    // definido pelo AuthContext

export function setOnSessionExpired(callback) {
  aoExpirarSessao = callback;
}

async function executar(path, { method = 'GET', body, headers = {}, timeout = TIMEOUT_PADRAO }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null; // resposta não-JSON (ex.: página de erro HTML) é descartada
    }

    // Log só de metadados, e só em desenvolvimento: nunca corpo (senhas, dados financeiros).
    if (__DEV__) console.log(`[api] ${method} ${path} -> ${res.status}`);

    return { res, data };
  } catch (e) {
    const err = new Error(
      e?.name === 'AbortError'
        ? 'O servidor demorou para responder. Tente novamente.'
        : 'Sem conexão com o servidor. Verifique sua internet.'
    );
    err.status = 0;
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function renovarSessao() {
  renovando ??= executar('/auth/refresh', { method: 'POST' })
    .then(({ res }) => res.ok)
    .catch(() => false)
    .finally(() => { renovando = null; });
  return renovando;
}

async function request(path, options = {}) {
  if (!CONEXAO_SEGURA) {
    const err = new Error('Conexão insegura bloqueada.');
    err.status = 0;
    throw err;
  }

  let { res, data } = await executar(path, options);

  // Access token dura 15 min: em 401 renova uma vez e repete a chamada original.
  const ehRotaDeAuth = path.startsWith('/auth/');
  if (res.status === 401 && !ehRotaDeAuth) {
    const renovou = await renovarSessao();
    if (renovou) {
      ({ res, data } = await executar(path, options));
    }
    if (res.status === 401 && aoExpirarSessao) aoExpirarSessao();
  }

  if (!res.ok) {
    // O backend devolve erros como { error }. A mensagem pode ser mostrada ao usuário.
    const err = new Error((data && (data.error || data.message)) || 'Não foi possível concluir a operação.');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export { BASE_URL, request, renovarSessao };
