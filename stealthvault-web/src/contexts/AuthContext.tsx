import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiService } from '@/services/api';
import { decryptVaultKey } from '@/services/crypto';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVaultUnlocked: boolean;
  vaultKey: CryptoKey | null;
  salt: string | null;
  vaultKeyEncMaster: string | null;
  autoLockMinutes: number;
  login: (username: string, password: string) => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<void>;
  lockVault: () => void;
  logout: () => void;
  setVaultKey: (key: CryptoKey) => void;
  setSalt: (salt: string) => void;
  setVaultKeyEncMaster: (v: string) => void;
  setAutoLockMinutes: (mins: number) => void;
  resetActivityTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTO_LOCK_STORAGE_KEY = 'stealthvault_autolock_minutes';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [salt, setSalt] = useState<string | null>(null);
  const [vaultKeyEncMaster, setVaultKeyEncMaster] = useState<string | null>(null);
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(() => {
    const stored = localStorage.getItem(AUTO_LOCK_STORAGE_KEY);
    return stored ? Math.min(Number(stored), 30) : 10;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lockVault = useCallback(() => {
    setVaultKey(null);
  }, []);

  const resetActivityTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (vaultKey && autoLockMinutes > 0) {
      timerRef.current = setTimeout(() => {
        lockVault();
      }, autoLockMinutes * 60 * 1000);
    }
  }, [vaultKey, autoLockMinutes, lockVault]);

  // Set up activity listeners when vault is unlocked
  useEffect(() => {
    if (!vaultKey) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    resetActivityTimer();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handler = () => resetActivityTimer();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [vaultKey, resetActivityTimer]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiService.login({ username, password });

    if (!response.isSuccess) {
      throw new Error(response.errorMessage || 'Login failed');
    }

    apiService.setToken(response.token);

    setUser({
      userId: response.userId,
      name: response.name,
      username: response.username,
      email: response.email,
    });
    setSalt(response.salt);
    setVaultKeyEncMaster(response.vaultKeyEncMaster);
  }, []);

  const unlockVault = useCallback(async (masterPassword: string) => {
    if (!salt || !vaultKeyEncMaster) {
      throw new Error('Not logged in');
    }
    const key = await decryptVaultKey(masterPassword, salt, vaultKeyEncMaster);
    setVaultKey(key);
  }, [salt, vaultKeyEncMaster]);

  const logout = useCallback(() => {
    setUser(null);
    setVaultKey(null);
    setSalt(null);
    setVaultKeyEncMaster(null);
    apiService.setToken(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const setAutoLockMinutes = useCallback((mins: number) => {
    const clamped = Math.max(1, Math.min(30, mins));
    setAutoLockMinutesState(clamped);
    localStorage.setItem(AUTO_LOCK_STORAGE_KEY, String(clamped));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isVaultUnlocked: !!user && !!vaultKey,
      vaultKey, salt, vaultKeyEncMaster,
      autoLockMinutes,
      login, unlockVault, lockVault, logout,
      setVaultKey, setSalt, setVaultKeyEncMaster,
      setAutoLockMinutes, resetActivityTimer,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
