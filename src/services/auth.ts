/**
 * G Pay.nu - Biometric Authentication Service
 * Interfaces with Android BiometricPrompt via expo-local-authentication.
 * 
 * SECURITY NOTICE:
 * Biometric validation is performed exclusively by the Android OS Trusted Execution
 * Environment (TEE) / Keyguard. This app never accesses, collects, stores, or handles
 * raw biometric sensor or template data.
 */

import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricStatus {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  isFingerprintSupported: boolean;
  isFacialSupported: boolean;
  securityLevel: string;
  canAuthenticate: boolean;
}

export interface AuthResult {
  success: boolean;
  method: 'biometric' | 'pin';
  error?: string;
  errorMessage?: string;
}

/**
 * Inspects device biometric capabilities without triggering any prompts
 */
export async function getBiometricStatus(): Promise<BiometricStatus> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
    const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let securityLevelName = 'NONE';
    try {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      switch (level) {
        case LocalAuthentication.SecurityLevel.SECRET:
          securityLevelName = 'SECRET (PIN/Pattern)';
          break;
        case LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG:
          securityLevelName = 'BIOMETRIC (Strong)';
          break;
        case LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK:
          securityLevelName = 'BIOMETRIC (Weak)';
          break;
        default:
          securityLevelName = 'NONE';
      }
    } catch {
      securityLevelName = 'UNKNOWN';
    }

    const typeNames: string[] = [];
    let isFingerprint = false;
    let isFace = false;

    for (const type of authTypes) {
      if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
        typeNames.push('Fingerprint');
        isFingerprint = true;
      } else if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
        typeNames.push('Face Unlock');
        isFace = true;
      } else if (type === LocalAuthentication.AuthenticationType.IRIS) {
        typeNames.push('Iris');
      }
    }

    return {
      hasHardware,
      isEnrolled,
      supportedTypes: typeNames,
      isFingerprintSupported: isFingerprint,
      isFacialSupported: isFace,
      securityLevel: securityLevelName,
      canAuthenticate: hasHardware && isEnrolled,
    };
  } catch (err) {
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      isFingerprintSupported: false,
      isFacialSupported: false,
      securityLevel: 'ERROR',
      canAuthenticate: false,
    };
  }
}

/**
 * Triggers the official Android OS biometric prompt.
 * Strictly checks the returned OS confirmation result.
 */
export async function authenticateWithBiometrics(
  promptMessage = 'Confirm your identity to unlock G Pay.nu'
): Promise<AuthResult> {
  try {
    const status = await getBiometricStatus();

    if (!status.hasHardware) {
      return {
        success: false,
        method: 'biometric',
        error: 'no_hardware',
        errorMessage: 'Biometric sensor not detected on this device.',
      };
    }

    if (!status.isEnrolled) {
      return {
        success: false,
        method: 'biometric',
        error: 'not_enrolled',
        errorMessage: 'No biometric credentials enrolled in Android Settings.',
      };
    }

    const response = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use App PIN',
      fallbackLabel: 'Enter PIN',
      disableDeviceFallback: false,
    });

    if (response.success) {
      return {
        success: true,
        method: 'biometric',
      };
    }

    // Map OS error to user-friendly message
    let message = 'Authentication failed. Please try again.';
    if (response.error === 'user_cancel') {
      message = 'Authentication cancelled by user.';
    } else if (response.error === 'system_cancel') {
      message = 'Authentication cancelled by system.';
    } else if (response.error === 'lockout') {
      message = 'Too many attempts. Biometric sensor temporarily locked.';
    }

    return {
      success: false,
      method: 'biometric',
      error: response.error,
      errorMessage: message,
    };
  } catch (err: any) {
    return {
      success: false,
      method: 'biometric',
      error: 'exception',
      errorMessage: err?.message || 'Biometric authentication encountered an error.',
    };
  }
}

/**
 * Default fallback security PIN for the simulated wallet
 */
export const DEFAULT_SIMULATED_PIN = '1234';

/**
 * Validates the simulated fallback PIN.
 */
export function verifySimulatedPIN(pin: string): AuthResult {
  if (pin === DEFAULT_SIMULATED_PIN) {
    return {
      success: true,
      method: 'pin',
    };
  }
  return {
    success: false,
    method: 'pin',
    error: 'invalid_pin',
    errorMessage: 'Incorrect PIN. Try default test PIN: 1234',
  };
}
