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
import { Spacing, BorderRadius, Typography } from '@/theme';
import { verifySimulatedPIN, getActivePIN } from '@/services/auth';
import { useTheme } from '@/context/ThemeContext';

interface PinFallbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export function PinFallbackModal({ visible, onClose, onSuccess }: PinFallbackModalProps) {
  const { colors } = useTheme();
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
          const finalPin = nextPin;
          setTimeout(() => {
            setPin('');
            setError(null);
            onSuccess(finalPin);
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
        <Pressable
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderLight,
                },
              ]}>
              <Ionicons name="key-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[Typography.title1, { color: colors.textPrimary }]}>
              Enter Security PIN
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
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
                    { borderColor: colors.border },
                    isFilled && [styles.dotFilled, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    error ? [styles.dotError, { backgroundColor: colors.danger, borderColor: colors.danger }] : null,
                  ]}
                />
              );
            })}
          </View>

          {/* Error Message or Hint */}
          {error ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          ) : (
            <View style={[styles.hintPill, { backgroundColor: colors.badgeBackground }]}>
              <Text style={[styles.hintText, { color: colors.badgeText }]}>
                Active test PIN: <Text style={styles.hintBold}>{getActivePIN()}</Text>
              </Text>
            </View>
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
                        <Text style={[styles.actionKeyText, { color: colors.textSecondary }]}>
                          CLEAR
                        </Text>
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
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.keyButton,
                        {
                          backgroundColor: colors.surfaceSubtle,
                          borderColor: colors.borderLight,
                        },
                      ]}
                      activeOpacity={0.6}
                      onPress={() => handleDigit(key)}>
                      <Text style={[styles.keyText, { color: colors.textPrimary }]}>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
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
    backgroundColor: 'transparent',
  },
  dotFilled: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dotError: {},
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  hintPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
  },
  hintBold: {
    fontWeight: '700',
  },
  keypad: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  keyButton: {
    width: 68,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
  },
  actionKey: {
    width: 68,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionKeyText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    marginTop: Spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
