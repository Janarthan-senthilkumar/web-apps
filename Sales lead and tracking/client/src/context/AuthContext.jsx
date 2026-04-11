import { createContext, useContext, useEffect, useMemo, useState } from "react";
import apiClient, { storageKeys } from "../api/apiClient";

const AuthContext = createContext(null);
const API_BASE_URL = apiClient.defaults.baseURL;

const readStoredUser = () => {
  const raw = localStorage.getItem(storageKeys.user);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(storageKeys.user);
    return null;
  }
};

const toAuthErrorMessage = (error, fallback) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ERR_NETWORK") {
    return `Cannot reach API at ${API_BASE_URL}. Start the backend server and try again.`;
  }

  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token));
  const [loading, setLoading] = useState(false);

  const persistSession = (authToken, authUser) => {
    localStorage.setItem(storageKeys.token, authToken);
    localStorage.setItem(storageKeys.user, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const clearSession = () => {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
    setToken(null);
    setUser(null);
  };

  const login = async (payload) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", payload);
      persistSession(response.data.token, response.data.user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: toAuthErrorMessage(error, "Login failed")
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", payload);
      persistSession(response.data.token, response.data.user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: toAuthErrorMessage(error, "Registration failed")
      };
    } finally {
      setLoading(false);
    }
  };

  const bootstrapAdmin = async (payload) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/bootstrap-admin", payload);
      persistSession(response.data.token, response.data.user);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: toAuthErrorMessage(error, "Bootstrap failed")
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  useEffect(() => {
    const syncMe = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await apiClient.get("/auth/me");
        setUser(response.data.user);
        localStorage.setItem(storageKeys.user, JSON.stringify(response.data.user));
      } catch (error) {
        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          clearSession();
        }
      }
    };

    syncMe();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      bootstrapAdmin,
      logout,
      isAuthenticated: Boolean(token && user)
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
