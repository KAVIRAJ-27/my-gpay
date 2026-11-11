/**
 * G Pay.nu - Authentication Context
 * Manages biometric and PIN authentication state.
 * Enforces strict lock state: Home is strictly inaccessible unless authenticated.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  getBiometricStatus,
  authenticateWithBiometrics,
  verifySimulatedPIN,
  BiometricStatus,
} from '@/services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authMethodUsed: 'biometric' | 'pin' | null;
  authError: string | null;
  biometricStatus: BiometricStatus | null;
  authenticateBiometric: () => Promise<boolean>;
  authenticatePIN: (pin: string) => boolean;
  lockSimulator: () => void;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethodUsed, setAuthMethodUsed] = useState<'biometric' | 'pin' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [biometricStatus, setBiometricStatus] = useState<BiometricStatus | null>(null);

  // Initialize biometric capabilities on startup
  useEffect(() => {
    async function init() {
      try {
        const status = await getBiometricStatus();
        setBiometricStatus(status);
      } catch (err) {
        console.warn('Biometric status init error:', err);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  const authenticateBiometric = useCallback(async (): Promise<boolean> => {
    if (isAuthenticating) return false;
    setIsAuthenticating(true);
    setAuthError(null);

    const result = await authenticateWithBiometrics('Verify fingerprint to access G Pay.nu');
    setIsAuthenticating(false);

    if (result.success) {
      setIsAuthenticated(true);
      setAuthMethodUsed('biometric');
      setAuthError(null);
      return true;
    } else {
      setAuthError(result.errorMessage || 'Biometric authentication failed.');
      return false;
    }
  }, [isAuthenticating]);

  const authenticatePIN = useCallback((pin: string): boolean => {
    const result = verifySimulatedPIN(pin);
    if (result.success) {
      setIsAuthenticated(true);
      setAuthMethodUsed('pin');
      setAuthError(null);
      return true;
    } else {
      setAuthError(result.errorMessage || 'Incorrect security PIN.');
      return false;
    }
  }, []);

  const lockSimulator = useCallback(() => {
    setIsAuthenticated(false);
    setAuthMethodUsed(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthenticating,
        authMethodUsed,
        authError,
        biometricStatus,
        authenticateBiometric,
        authenticatePIN,
        lockSimulator,
        clearAuthError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
