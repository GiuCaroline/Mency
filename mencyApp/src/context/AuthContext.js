import { createContext, useContext, useState, useEffect } from "react";
import auth from '../api/auth.js';
import pluggy from '../api/pluggy.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dadosFinanceiros, setDadosFinanceiros] = useState(null);
  const [loadingFinanceiros, setLoadingFinanceiros] = useState(false);

  useEffect(() => {
    auth.me()
      .then(data => setUsuario(data?.user || data))
      .catch(() => setUsuario(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    const data = await auth.login({ email, password });
    setUsuario(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (e) {
    } finally {
      setUsuario(null);
      setDadosFinanceiros(null); // limpa cache ao sair
    }
  };

  const deleteAccount = async () => {
    await auth.deleteAccount();
    setUsuario(null);
    setDadosFinanceiros(null);
  };

  const carregarDadosFinanceiros = async (forcar = false) => {
    if (dadosFinanceiros && !forcar) return dadosFinanceiros;
    if (loadingFinanceiros) return null;

    setLoadingFinanceiros(true);
    try {
      const resContas = await pluggy.listAccounts();
      const contasData = resContas?.contas || [];
      const totalSaldo = resContas?.totalSaldo || 0;

      const todasPromises = contasData.map(c =>
        pluggy.getAccountTransactions(c.id).then(r => r?.transacoes || []).catch(() => [])
      );
      const resultados = await Promise.all(todasPromises);
      const todasTransacoes = resultados.flat();

      const dados = { contas: contasData, totalSaldo, todasTransacoes };
      setDadosFinanceiros(dados);
      return dados;
    } catch (e) {
      console.log('Erro ao carregar dados financeiros:', e);
      return null;
    } finally {
      setLoadingFinanceiros(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario, setUsuario,
      login, logout, deleteAccount, isLoading,
      dadosFinanceiros, loadingFinanceiros, carregarDadosFinanceiros,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}