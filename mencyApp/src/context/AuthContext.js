import { createContext, useContext, useState, useEffect } from "react";
import auth from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    }
  };

  const deleteAccount = async () => {
    await auth.deleteAccount();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, login, logout, deleteAccount, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}