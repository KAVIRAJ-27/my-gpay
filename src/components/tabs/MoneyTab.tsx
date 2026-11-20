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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const formattedBalance = balance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
      {/* Header Row */}
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setIsBalanceVisible(!isBalanceVisible)}
              accessibilityLabel={isBalanceVisible ? 'Hide balance' : 'Show balance'}>
              <Ionicons
                name={isBalanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            <View style={styles.statusPill}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Simulated</Text>
            </View>
          </View>
        </View>

        {/* Account Details Specs */}
        <View style={styles.specsGrid}>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Account Number</Text>
            <Text style={styles.specValue}>{USER_PROFILE.accountNumberMasked}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>IFSC Code</Text>
            <Text style={styles.specValue}>UTIB0000214</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>UPI ID</Text>
            <Text style={styles.specValue}>{USER_PROFILE.upiId}</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Branch</Text>
            <Text style={styles.specValue}>Tech Park Demo Branch</Text>
          </View>
        </View>

        {/* Balance Display */}
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Simulated SQLite Balance</Text>
          <Text style={styles.balanceValue}>
            {isBalanceVisible ? `₹${formattedBalance}` : '₹ ••••••'}
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
            <Text style={styles.addFundsBtnText}>Manage & Top Up</Text>
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
      <Text style={styles.sectionHeader}>Simulated Payment Cards</Text>
      <View style={[CommonStyles.card, styles.methodsCard]}>
        {/* Card 1: Virtual Credit */}
        <View style={styles.methodRow}>
          <View style={[styles.methodIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="card" size={20} color={Colors.secondary} />
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Nu Platinum Virtual Credit</Text>
            <Text style={styles.methodSub}>•••• 9021 • Exp: 11/28 • Visa</Text>
          </View>
          <View style={styles.limitTag}>
            <Text style={styles.limitTagText}>Limit ₹1,50,000</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Card 2: Titanium Debit */}
        <View style={styles.methodRow}>
          <View style={[styles.methodIcon, { backgroundColor: 'rgba(0, 210, 255, 0.15)' }]}>
            <Ionicons name="card-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Axis Titanium Demo Debit</Text>
            <Text style={styles.methodSub}>•••• 5842 • Exp: 08/29 • RuPay</Text>
          </View>
          <View style={[styles.limitTag, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Text style={[styles.limitTagText, { color: Colors.success }]}>Linked</Text>
          </View>
        </View>
      </View>

      {/* Safety & Limits Card */}
      <Text style={styles.sectionHeader}>Simulator Limits & Guardrails</Text>
      <View style={[CommonStyles.card, styles.limitsCard]}>
        <View style={styles.limitRow}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.limitTitle}>Daily Simulated Transfer Cap</Text>
            <Text style={styles.limitDesc}>₹1,00,000.00 max per day across all contacts</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.limitRow}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.brandNu} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.limitTitle}>100% Offline SQLite Encryption</Text>
            <Text style={styles.limitDesc}>Zero financial network connectivity or UPI API integration</Text>
          </View>
        </View>
      </View>

      {/* Watermark Banner */}
      <View style={styles.watermarkBox}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.warning} />
        <Text style={styles.watermarkText}>
          INDEPENDENT DEMO WALLET SIMULATOR • FOR DEMONSTRATION PURPOSES ONLY
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
    padding: Spacing.lg,
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
    fontSize: 16,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 4,
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
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  specItem: {
    width: '48%',
  },
  specLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 26,
    color: Colors.primary,
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
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warning,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
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
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  methodSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  limitTag: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  limitTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  limitsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  limitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  limitDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  watermarkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
    flex: 1,
    lineHeight: 16,
  },
});
