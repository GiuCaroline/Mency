export function formatMoney(value) {
  const number = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  if (Number.isNaN(number) || number === null || number === undefined) {
    return '0,00';
  }
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
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
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export function getMonthKey(dateValue) {
  const date = parseDate(dateValue);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function normalizeTransaction(transaction, account) {
  const amount = Number(transaction.amount ?? transaction.value ?? transaction.valor ?? 0);
  const date = parseDate(transaction.date ?? transaction.createdAt ?? transaction.postedAt ?? transaction.data);
  const description = transaction.description || transaction.descriptionRaw || transaction.merchant || transaction.descricao || transaction.description_raw || transaction.category || transaction.categoria || 'Transação';
  return {
    id: transaction.id ?? transaction.transactionId ?? transaction._id ?? null,
    description,
    currencyCode: transaction.currencyCode || transaction.moeda || 'BRL',
    amount: Number.isNaN(amount) ? 0 : amount,
    date,
    dateFormatted: formatDate(date),
    dateTimeFormatted: formatDateTime(date),
    balance: Number(transaction.balance ?? transaction.saldo ?? 0),
    category: transaction.category || transaction.operationCategory || transaction.categoria || 'Sem categoria',
    categoryId: transaction.categoryId || null,
    accountId: transaction.accountId || account?.id,
    accountName: account?.name || account?.marketingName || account?.nome || 'Conta',
    type: transaction.type || transaction.tipo || 'DEBIT',
    status: transaction.status || 'POSTED',
    creditCardMetadata: transaction.creditCardMetadata || null,
    raw: transaction,
  };
}

export function groupByCategory(transactions) {
  return transactions.reduce((acc, transaction) => {
    const key = transaction.category || 'Sem categoria';
    if (!acc[key]) {
      acc[key] = {
        categoria: key,
        valor: 0,
      };
    }
    acc[key].valor += transaction.amount;
    return acc;
  }, {});
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

export function sumAmounts(transactions) {
  return transactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}

export function isCreditTransaction(transaction) {
  return String(transaction.type).toUpperCase() === 'CREDIT';
}

export function isDebitTransaction(transaction) {
  return !isCreditTransaction(transaction);
}

export function isSalaryTransaction(transaction) {
  const description = (transaction.description || '').toLowerCase();
  const category = (transaction.category || '').toLowerCase();
  return /salari|salary|folha|pagamento/.test(description) || /salari|salary|folha|pagamento/.test(category);
}

export function clampPercentage(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function normalizeListResponse(response) {
  if (!response) {
    return [];
  }
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response.results)) {
    return response.results;
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.accounts)) {
    return response.accounts;
  }
  // API may return Portuguese key `contas` with different field names — normalize
  if (Array.isArray(response.contas)) {
    return response.contas.map((c) => {
      const balance = Number(c.balance ?? c.saldo ?? (c.bankData && c.bankData.closingBalance) ?? (c.creditData && c.creditData.balance) ?? 0);
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
  if (!response) {
    return [];
  }
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response.results)) {
    return response.results;
  }
  if (Array.isArray(response.data)) {
    // response.data may be an object containing `transacoes` (Portuguese) or `transactions`
    if (Array.isArray(response.data.transacoes)) return response.data.transacoes;
    if (Array.isArray(response.data.transactions)) return response.data.transactions;
    // sometimes `data` itself is the array
    return response.data;
  }
  // direct Portuguese `transacoes` at root
  if (Array.isArray(response.transacoes)) return response.transacoes;
  if (Array.isArray(response.transactions)) return response.transactions;
  // support wrapped response with `data` key that contains `account` and `transacoes`
  if (response.data && Array.isArray(response.data.transacoes)) return response.data.transacoes;
  return [];
}

export function formatCPF(cpf) {
  if (!cpf) return '—';
  return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}