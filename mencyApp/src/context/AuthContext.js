import { createContext, useContext, useState, useEffect, useRef } from "react";
import auth from '../api/auth.js';
import pluggy from '../api/pluggy.js';
import { setOnSessionExpired, renovarSessao } from '../api/client.js';
import { irParaLogin } from '../navigation/navigationRef.js';

const AuthContext = createContext(null);

// Limite de páginas por conta: protege a cota de 200 req/15 min do backend.
const MAX_PAGINAS_POR_CONTA = 10;

async function buscarTodasTransacoes(accountId) {
  const todas = [];
  let after;
  for (let i = 0; i < MAX_PAGINAS_POR_CONTA; i++) {
    const r = await pluggy.getAccountTransactions(accountId, after ? { after } : {});
    todas.push(...(r?.transacoes || []));
    after = r?.proximaPagina;
    if (!after) break;
  }
  return todas;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dadosFinanceiros, setDadosFinanceiros] = useState(null);
  const [loadingFinanceiros, setLoadingFinanceiros] = useState(false);
  const carregandoRef = useRef(null);

  const limparSessao = () => {
    setUsuario(null);
    setDadosFinanceiros(null);
  };

  useEffect(() => {
    // Sessão expirada (refresh falhou): limpa tudo e volta para o login.
    setOnSessionExpired(() => {
      limparSessao();
      irParaLogin();
    });

    // Ao abrir o app: /auth/me -> se 401, /auth/refresh -> se ok, /auth/me de novo.
    (async () => {
      try {
        const data = await auth.me();
        setUsuario(data?.user || null);
      } catch {
        try {
          if (await renovarSessao()) {
            const data = await auth.me();
            setUsuario(data?.user || null);
          } else {
            setUsuario(null);
          }
        } catch {
          setUsuario(null);
        }
      } finally {
        setIsLoading(false);
      }
    })();

    return () => setOnSessionExpired(null);
  }, []);

  const login = async ({ email, password }) => {
    const data = await auth.login({ email, password });
    setUsuario(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await auth.logout(); // os cookies vivem na camada nativa: só o servidor os apaga
    } catch (e) {
    } finally {
      limparSessao();
    }
  };

  const deleteAccount = async () => {
    await auth.deleteAccount();
    limparSessao();
  };

  const carregarDadosFinanceiros = async (forcar = false) => {
    if (dadosFinanceiros && !forcar) return dadosFinanceiros;
    if (carregandoRef.current) return carregandoRef.current; // reaproveita a carga em andamento

    setLoadingFinanceiros(true);
    carregandoRef.current = (async () => {
      try {
        const resContas = await pluggy.listAccounts();
        const contasData = resContas?.contas || [];
        const totalSaldo = resContas?.totalSaldo || 0;

        const resultados = await Promise.all(
          contasData.map(c => buscarTodasTransacoes(c.id).catch(() => []))
        );
        const todasTransacoes = resultados.flat();

        const dados = { contas: contasData, totalSaldo, todasTransacoes };
        setDadosFinanceiros(dados);
        return dados;
      } catch (e) {
        if (__DEV__) console.log('Erro ao carregar dados financeiros:', e?.status, e?.message);
        return null;
      } finally {
        setLoadingFinanceiros(false);
        carregandoRef.current = null;
      }
    })();
    return carregandoRef.current;
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
