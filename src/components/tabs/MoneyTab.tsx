import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { USER_PROFILE } from '@/data/mockData';
import { DemoBadge } from '../DemoBadge';

interface MoneyTabProps {
  balance?: number;
  onAddFunds: () => void;
  onResetWallet?: () => void;
}

export function MoneyTab({
  balance = USER_PROFILE.demoBalance,
  onAddFunds,
  onResetWallet,
}: MoneyTabProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleResetPress = () => {
    Alert.alert(
      'Reset Demo Wallet?',
      'This will reset your local simulated balance back to the initial prototype state (₹24,850.00). This affects local SQLite demo storage only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Wallet',
          style: 'destructive',
          onPress: () => onResetWallet?.(),
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Money & Accounts</Text>
          <Text style={styles.subtitle}>
            Offline simulation accounts • No real financial connection
          </Text>
        </View>
        <DemoBadge />
      </View>

      {/* Main Demo Account Card */}
      <View style={[CommonStyles.cardElevated, styles.accountCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.bankBadge}>
            <Ionicons name="business" size={18} color={Colors.primary} />
            <Text style={styles.bankName}>{USER_PROFILE.bankName}</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>Simulated</Text>
          </View>
        </View>

        <Text style={styles.accountNumber}>
          Account: {USER_PROFILE.accountNumberMasked}
        </Text>
        <Text style={styles.upiHandle}>UPI ID: {USER_PROFILE.upiId}</Text>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Simulated SQLite Balance</Text>
          <Text style={styles.balanceValue}>
            ₹
            {balance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[CommonStyles.primaryButton, styles.addFundsBtn]}
            activeOpacity={0.8}
            onPress={onAddFunds}>
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={Colors.textInverse}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addFundsBtnText}>Top Up Demo Balance</Text>
          </TouchableOpacity>

          {onResetWallet && (
            <TouchableOpacity
              style={styles.resetBtn}
              activeOpacity={0.7}
              onPress={handleResetPress}>
              <Ionicons
                name="refresh-outline"
                size={16}
                color={Colors.warning}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Linked Simulated Cards */}
      <Text style={styles.sectionHeader}>Simulated Payment Methods</Text>
      <View style={[CommonStyles.card, styles.methodsCard]}>
        <View style={styles.methodRow}>
          <View style={styles.methodIcon}>
            <Ionicons name="card-outline" size={20} color={Colors.brandNu} />
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Demo Platinum Credit Card</Text>
            <Text style={styles.methodSub}>•••• 9021 • Visa Simulation</Text>
          </View>
          <Text style={styles.methodLimit}>₹1,50,000</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.methodRow}>
          <View style={styles.methodIcon}>
            <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>G Pay.nu Local Cash</Text>
            <Text style={styles.methodSub}>Offline Sandbox Wallet</Text>
          </View>
          <Text style={styles.methodLimit}>Active</Text>
        </View>
      </View>

      {/* Safety Notice */}
      <View style={styles.safetyBox}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={Colors.textTertiary}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.safetyText}>
          Balances and limits shown are mock numbers stored locally in SQLite.
          G Pay.nu does not connect to bank APIs or payment rails.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.screenPadding,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  accountCard: {
    padding: Spacing.xl,
    backgroundColor: '#0F1626',
    borderWidth: 1.5,
    borderColor: '#1F2C4C',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bankName: {
    ...Typography.title2,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  accountNumber: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  upiHandle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    ...Typography.hero,
    fontSize: 26,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addFundsBtn: {
    flex: 1,
    height: 44,
  },
  addFundsBtnText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textInverse,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  resetBtnText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warning,
  },
  sectionHeader: {
    ...Typography.title2,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  methodsCard: {
    padding: Spacing.none,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  methodSub: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  methodLimit: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  safetyText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
});
