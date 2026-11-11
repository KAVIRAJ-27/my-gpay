import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';

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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const formattedBalance = balance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <View style={[CommonStyles.cardElevated, styles.card]}>
      {/* Top Banner inside card */}
      <View style={styles.topRow}>
        <View style={styles.accountBadge}>
          <Ionicons name="card-outline" size={14} color={Colors.primary} />
          <Text style={styles.accountBadgeText}>
            {bankName} ({accountMasked})
          </Text>
        </View>

        <TouchableOpacity
          style={styles.eyeButton}
          activeOpacity={0.7}
          onPress={() => setIsBalanceVisible(!isBalanceVisible)}
          accessibilityLabel={isBalanceVisible ? 'Hide balance' : 'Show balance'}>
          <Ionicons
            name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Balance Amount Section */}
      <View style={styles.amountContainer}>
        <Text style={styles.balanceLabel}>Available Demo Balance</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
          <Text style={styles.balanceAmount}>
            {isBalanceVisible ? formattedBalance : '••••••'}
          </Text>
        </View>
        <Text style={styles.subtext}>
          Local Offline Simulation • No Real Banking Connections
        </Text>
      </View>

      {/* Card Action Chips */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={styles.chipButton}
          activeOpacity={0.7}
          onPress={onAddDemoCash}>
          <Ionicons name="add-circle-outline" size={15} color={Colors.brandNu} />
          <Text style={styles.chipText}>Add Demo Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chipButton}
          activeOpacity={0.7}
          onPress={onOpenDetails}>
          <Ionicons name="information-circle-outline" size={15} color={Colors.primary} />
          <Text style={styles.chipText}>Simulation Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: '#0F1626',
    borderWidth: 1.5,
    borderColor: '#1F2C4C',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  accountBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountContainer: {
    marginVertical: Spacing.xs,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 6,
    lineHeight: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
