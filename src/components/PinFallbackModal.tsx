import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { verifySimulatedPIN, DEFAULT_SIMULATED_PIN } from '@/services/auth';

interface PinFallbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PinFallbackModal({ visible, onClose, onSuccess }: PinFallbackModalProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        const result = verifySimulatedPIN(nextPin);
        if (result.success) {
          setTimeout(() => {
            setPin('');
            setError(null);
            onSuccess();
          }, 150);
        } else {
          setError(result.errorMessage || 'Incorrect PIN');
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={Typography.title1}>Enter Security PIN</Text>
            <Text style={Typography.caption}>
              Biometric fallback for G Pay.nu
            </Text>
          </View>

          {/* PIN Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isFilled && styles.dotFilled,
                    error && styles.dotError,
                  ]}
                />
              );
            })}
          </View>

          {/* Error Message */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.hintText}>
              Default test PIN: <Text style={styles.hintBold}>{DEFAULT_SIMULATED_PIN}</Text>
            </Text>
          )}

          {/* Keypad Grid */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['clear', '0', 'back'],
            ].map((row, rIndex) => (
              <View key={rIndex} style={styles.keyRow}>
                {row.map((key) => {
                  if (key === 'clear') {
                    return (
                      <TouchableOpacity
                        key={key}
                        style={styles.actionKey}
                        onPress={handleClear}>
                        <Text style={styles.actionKeyText}>CLEAR</Text>
                      </TouchableOpacity>
                    );
                  }
                  if (key === 'back') {
                    return (
                      <TouchableOpacity
                        key={key}
                        style={styles.actionKey}
                        onPress={handleDelete}>
                        <Ionicons
                          name="backspace-outline"
                          size={24}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.keyButton}
                      activeOpacity={0.7}
                      onPress={() => handleDigit(key)}>
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: Spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  dotError: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  hintText: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  hintBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  keypad: {
    width: '100%',
    marginVertical: Spacing.sm,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keyButton: {
    width: 68,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionKey: {
    width: 68,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionKeyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textSecondary,
  },
  cancelButton: {
    marginTop: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

