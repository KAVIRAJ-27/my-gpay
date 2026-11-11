import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { USER_PROFILE } from '@/data/mockData';

interface MoneyTabProps {
  onAddFunds: () => void;
}

export function MoneyTab({ onAddFunds }: MoneyTabProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Money & Accounts</Text>
      <Text style={styles.subtitle}>
        Offline simulation accounts • No real financial connection
      </Text>

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
          <Text style={styles.balanceLabel}>Simulated Balance</Text>
          <Text style={styles.balanceValue}>
            ₹
            {USER_PROFILE.demoBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </Text>
        </View>

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
          Balances and limits shown are mock numbers stored locally. G Pay.nu does
          not integrate with real bank servers or card networks.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  accountCard: {
    backgroundColor: '#0E172A',
    borderColor: '#1E293B',
    padding: Spacing.xl,
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
    gap: 8,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  accountNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  upiHandle: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  balanceRow: {
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  addFundsBtn: {
    width: '100%',
  },
  addFundsBtnText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  methodsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  methodSub: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  methodLimit: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brandNu,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  safetyText: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 17,
    flex: 1,
  },
});
