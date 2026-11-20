import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

interface NumericKeypadProps {
  onDigitPress: (digit: string) => void;
  onDecimalPress: () => void;
  onBackspacePress: () => void;
  onClearPress: () => void;
  onQuickAmountPress?: (amount: number) => void;
}

export function NumericKeypad({
  onDigitPress,
  onDecimalPress,
  onBackspacePress,
  onClearPress,
  onQuickAmountPress,
}: NumericKeypadProps) {
  const { colors } = useTheme();
  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <View style={styles.container}>
      {/* Quick Amount Suggestion Chips + Clear Button */}
      <View style={styles.quickBar}>
        <TouchableOpacity
          style={[
            styles.clearChip,
            {
              backgroundColor: colors.dangerSurface,
              borderColor: colors.dangerBorder,
            },
          ]}
          onPress={onClearPress}
          activeOpacity={0.7}
          accessibilityLabel="Clear amount">
          <Ionicons name="trash-outline" size={13} color={colors.danger} />
          <Text style={[styles.clearChipText, { color: colors.danger }]}>Clear</Text>
        </TouchableOpacity>

        <View style={styles.chipsRow}>
          {quickAmounts.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.amountChip,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onQuickAmountPress?.(val)}
              activeOpacity={0.75}
              accessibilityLabel={`Add ${val} rupees`}>
              <Text style={[styles.amountChipText, { color: colors.primary }]}>
                +₹{val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3x4 Numeric Keypad Grid */}
      <View style={styles.grid}>
        {/* Row 1: 1, 2, 3 */}
        <View style={styles.row}>
          {['1', '2', '3'].map((digit) => (
            <KeypadButton
              key={digit}
              label={digit}
              onPress={() => onDigitPress(digit)}
            />
          ))}
        </View>

        {/* Row 2: 4, 5, 6 */}
        <View style={styles.row}>
          {['4', '5', '6'].map((digit) => (
            <KeypadButton
              key={digit}
              label={digit}
              onPress={() => onDigitPress(digit)}
            />
          ))}
        </View>

        {/* Row 3: 7, 8, 9 */}
        <View style={styles.row}>
          {['7', '8', '9'].map((digit) => (
            <KeypadButton
              key={digit}
              label={digit}
              onPress={() => onDigitPress(digit)}
            />
          ))}
        </View>

        {/* Row 4: . , 0 , ⌫ */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.keyButton,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderLight,
              },
            ]}
            onPress={onDecimalPress}
            activeOpacity={0.6}
            accessibilityLabel="Decimal point">
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>•</Text>
          </TouchableOpacity>

          <KeypadButton label="0" onPress={() => onDigitPress('0')} />

          <TouchableOpacity
            style={[
              styles.keyButton,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.borderLight,
              },
            ]}
            onPress={onBackspacePress}
            onLongPress={onClearPress}
            activeOpacity={0.6}
            accessibilityLabel="Backspace">
            <Ionicons name="backspace-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function KeypadButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.keyButton,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderLight,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={`Key ${label}`}>
      <Text style={[styles.keyText, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  quickBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  clearChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  amountChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  amountChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  keyButton: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
  },
});
