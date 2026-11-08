import { request } from './client';

export const LIMITE_MENSAGEM = 1000;

// A resposta pode levar até ~60 s no pior caso (o backend tenta o LLM duas vezes).
export async function enviarMensagem(mensagem) {
  return request('/ai/chat', {
    method: 'POST',
    body: { mensagem },
    timeout: 65000,
  });
}

export async function listarMensagens() {
  return request('/ai/messages', { method: 'GET' });
}

export async function limparMensagens() {
  return request('/ai/messages', { method: 'DELETE' });
}

export default { enviarMensagem, listarMensagens, limparMensagens, LIMITE_MENSAGEM };
