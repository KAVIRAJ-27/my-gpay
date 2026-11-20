import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

interface BalanceCardProps {
  balance: number;
  currencySymbol?: string;
  bankName?: string;
  accountMasked?: string;
  onOpenDetails?: () => void;
  onAddDemoCash?: () => void;
}

export function BalanceCard({
  balance,
  currencySymbol = '₹',
  bankName = 'Axis Demo Bank',
  accountMasked = '•••• 5842',
  onOpenDetails,
  onAddDemoCash,
}: BalanceCardProps) {
  const { colors } = useTheme();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const formattedBalance = balance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View
      style={[
        CommonStyles.cardElevated,
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: '#000',
        },
      ]}>
      {/* Top Banner inside card */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.accountBadge,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}>
          <Ionicons name="card-outline" size={14} color={colors.primary} />
          <Text style={[styles.accountBadgeText, { color: colors.textSecondary }]}>
            {bankName} ({accountMasked})
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.eyeButton,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={() => setIsBalanceVisible(!isBalanceVisible)}
          accessibilityLabel={isBalanceVisible ? 'Hide balance' : 'Show balance'}>
          <Ionicons
            name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Balance Amount Section */}
      <View style={styles.amountContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          Available Demo Balance
        </Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.currencySymbol, { color: colors.primary }]}>
            {currencySymbol}
          </Text>
          <Text style={[styles.balanceAmount, { color: colors.textPrimary }]}>
            {isBalanceVisible ? formattedBalance : '••••••'}
          </Text>
        </View>
        <View style={[styles.watermarkBadge, { backgroundColor: colors.badgeBackground }]}>
          <Ionicons name="shield-outline" size={12} color={colors.badgeText} />
          <Text style={[styles.subtext, { color: colors.badgeText }]}>
            SIMULATED — NO REAL MONEY TRANSFERRED
          </Text>
        </View>
      </View>

      {/* Card Action Chips */}
      <View style={[styles.chipsRow, { borderTopColor: colors.divider }]}>
        <TouchableOpacity
          style={[
            styles.chipButton,
            styles.chipPrimary,
            { backgroundColor: colors.primary },
          ]}
          activeOpacity={0.8}
          onPress={onAddDemoCash}>
          <Ionicons name="add-circle" size={16} color={colors.textInverse} />
          <Text style={[styles.chipTextPrimary, { color: colors.textInverse }]}>
            Add Demo Funds
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipButton,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={onOpenDetails}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.chipText, { color: colors.textPrimary }]}>
            Simulation Info
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  amountContainer: {
    marginVertical: Spacing.xs,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  subtext: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  chipPrimary: {
    borderWidth: 0,
  },
  chipTextPrimary: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
