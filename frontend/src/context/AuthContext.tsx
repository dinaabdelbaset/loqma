import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  provider?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('loqma_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('loqma_token');
  });

  const login = (newUser: UserProfile, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('loqma_user', JSON.stringify(newUser));
    localStorage.setItem('loqma_token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('loqma_user');
    localStorage.removeItem('loqma_token');
    localStorage.removeItem('loqma_cart_v2');
    // إشعار سلة المشتريات والصفحات بتفريغ السلة فوراً
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('loqma:logout'));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
