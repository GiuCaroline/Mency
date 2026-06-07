// ─── Formatação ───────────────────────────────────────────────────────────────

export function formatMoney(value) {
  const number = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  if (Number.isNaN(number) || number === null || number === undefined) return '0,00';
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCPF(cpf) {
  if (!cpf) return '—';
  return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function sanitizarDescricao(descricao) {
  if (!descricao) return 'Outros';
  return descricao.replace(/_\d+$/, '').trim();
}

// ─── Datas ────────────────────────────────────────────────────────────────────

export function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDate(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function getDaysUntil(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
}

export function getMonthKey(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthWindow(dateValue, monthsBack = 6) {
  const date = parseDate(dateValue) || new Date();
  const months = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('pt-BR', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return months;
}

// ─── Meses disponíveis (da API) ───────────────────────────────────────────────

export function extrairMesesDisponiveis(transacoes) {
  const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const mesesCompletos = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const chavesUnicas = new Set();
  transacoes.forEach(t => {
    const data = new Date(t.data);
    chavesUnicas.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  });

  return Array.from(chavesUnicas)
    .sort((a, b) => b.localeCompare(a))
    .map(chave => {
      const [ano, mes] = chave.split('-');
      const idx = parseInt(mes, 10) - 1;
      return { chave, labelCurto: mesesNomes[idx], labelCompleto: `${mesesCompletos[idx]} ${ano}` };
    });
}

export function filtrarPorMes(transacoes, chave) {
  return transacoes.filter(t => {
    const data = new Date(t.data);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}` === chave;
  });
}

// ─── Categorização ────────────────────────────────────────────────────────────

const REGRAS_CATEGORIA = [
  { palavras: ['salario', 'salary', 'salário', 'folha', 'pagamento emp'], categoria: 'Salário' },
  { palavras: ['netflix', 'spotify', 'disney', 'hbo', 'amazon prime', 'apple tv', 'deezer', 'youtube premium'], categoria: 'Streaming' },
  { palavras: ['vivo', 'claro', 'tim', 'oi ', 'net serv', 'telecom', 'telefon', 'internet'], categoria: 'Telefone/Internet' },
  { palavras: ['condominio', 'condomínio', 'aluguel', 'iptu'], categoria: 'Moradia' },
  { palavras: ['mercado', 'supermercado', 'atacadao', 'carrefour', 'extra ', 'pao de acucar', 'hortifruti', 'ifood', 'rappi', 'uber eats'], categoria: 'Alimentação' },
  { palavras: ['uber', 'lyft', '99 ', 'taxi', 'combustivel', 'gasolina', 'posto ', 'metro ', 'onibus'], categoria: 'Transporte' },
  { palavras: ['farmacia', 'drogaria', 'medico', 'clinica', 'hospital', 'laboratorio', 'plano de saude', 'unimed'], categoria: 'Saúde' },
  { palavras: ['escola', 'faculdade', 'curso', 'udemy', 'alura', 'livro', 'livraria'], categoria: 'Educação' },
  { palavras: ['shopping', 'magazine', 'renner', 'riachuelo', 'zara', 'hm ', 'americanas', 'amazon', 'mercado livre'], categoria: 'Compras' },
];

export function categorizarTransacao(descricao) {
  if (!descricao) return 'Outros';
  const lower = descricao.toLowerCase();
  for (const regra of REGRAS_CATEGORIA) {
    if (regra.palavras.some(p => lower.includes(p))) return regra.categoria;
  }
  return 'Outros';
}

// Substitui isSalaryTransaction (mesma lógica, mais completa)
export function isSalaryTransaction(transaction) {
  return categorizarTransacao(transaction.descricao || transaction.description || '') === 'Salário';
}

export function isCreditTransaction(transaction) {
  return String(transaction.tipo || transaction.type || '').toUpperCase() === 'CREDIT';
}

export function isDebitTransaction(transaction) {
  return !isCreditTransaction(transaction);
}

// ─── Agrupamentos e cálculos ──────────────────────────────────────────────────

export function agruparPorCategoria(transacoes) {
  const gastos = transacoes.filter(t => t.valor < 0);
  const grupos = {};
  gastos.forEach(t => {
    const categoria = categorizarTransacao(t.descricao);
    if (!grupos[categoria]) grupos[categoria] = { id: categoria, categoria, valor: 0 };
    grupos[categoria].valor += Math.abs(t.valor);
  });
  return Object.values(grupos).sort((a, b) => b.valor - a.valor);
}

// Mantido para compatibilidade (usa campo normalizado 'category')
export function groupByCategory(transactions) {
  return transactions.reduce((acc, transaction) => {
    const key = transaction.category || 'Sem categoria';
    if (!acc[key]) acc[key] = { categoria: key, valor: 0 };
    acc[key].valor += transaction.amount;
    return acc;
  }, {});
}

export function calcularSalario(transacoes) {
  return transacoes
    .filter(t => t.valor > 0 && categorizarTransacao(t.descricao) === 'Salário')
    .reduce((acc, t) => acc + t.valor, 0);
}

export function calcularTotalGastos(transacoes) {
  return transacoes.filter(t => t.valor < 0).reduce((acc, t) => acc + Math.abs(t.valor), 0);
}

export function calcularTodasEntradas(transacoes) {
  return transacoes.filter(t => t.valor > 0).reduce((acc, t) => acc + t.valor, 0);
}

export function sumAmounts(transactions) {
  return transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
}

export function clampPercentage(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

// ─── Normalização de respostas da API ─────────────────────────────────────────

export function normalizeTransaction(transaction, account) {
  const amount = Number(transaction.amount ?? transaction.value ?? transaction.valor ?? 0);
  const date = parseDate(transaction.date ?? transaction.createdAt ?? transaction.postedAt ?? transaction.data);
  const description = transaction.description || transaction.descriptionRaw || transaction.merchant
    || transaction.descricao || transaction.description_raw || transaction.category
    || transaction.categoria || 'Transação';
  return {
    id: transaction.id ?? transaction.transactionId ?? transaction._id ?? null,
    description,
    currencyCode: transaction.currencyCode || transaction.moeda || 'BRL',
    amount: Number.isNaN(amount) ? 0 : amount,
    date,
    dateFormatted: formatDate(date),
    dateTimeFormatted: formatDateTime(date),
    balance: Number(transaction.balance ?? transaction.saldo ?? 0),
    category: categorizarTransacao(description),
    categoryId: transaction.categoryId || null,
    accountId: transaction.accountId || account?.id,
    accountName: account?.name || account?.marketingName || account?.nome || 'Conta',
    type: transaction.type || transaction.tipo || 'DEBIT',
    status: transaction.status || 'POSTED',
    creditCardMetadata: transaction.creditCardMetadata || null,
    raw: transaction,
  };
}

export function normalizeListResponse(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) {
    if (Array.isArray(response.data.transacoes)) return response.data.transacoes;
    if (Array.isArray(response.data.transactions)) return response.data.transactions;
    return response.data;
  }
  if (Array.isArray(response.accounts)) return response.accounts;
  if (Array.isArray(response.contas)) {
    return response.contas.map((c) => {
      const balance = Number(c.balance ?? c.saldo ?? c.bankData?.closingBalance ?? c.creditData?.balance ?? 0);
      return {
        id: c.id ?? c.accountId ?? c._id ?? c.itemId ?? null,
        name: c.name ?? c.marketingName ?? c.nome ?? '',
        marketingName: c.marketingName ?? c.nome ?? '',
        balance: Number.isNaN(balance) ? 0 : balance,
        type: c.type ?? c.subtype ?? c.tipo ?? 'BANK',
        currencyCode: c.currencyCode ?? c.moeda ?? 'BRL',
        bankData: c.bankData ?? null,
        creditData: c.creditData ?? null,
        raw: c,
      };
    });
  }
  return [];
}

export function normalizeTransactionsResponse(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data)) {
    if (Array.isArray(response.data.transacoes)) return response.data.transacoes;
    if (Array.isArray(response.data.transactions)) return response.data.transactions;
    return response.data;
  }
  if (Array.isArray(response.transacoes)) return response.transacoes;
  if (Array.isArray(response.transactions)) return response.transactions;
  if (response.data && Array.isArray(response.data.transacoes)) return response.data.transacoes;
  return [];
}