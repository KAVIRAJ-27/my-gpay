import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  BackHandler,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import {
  getWalletStats,
  addDemoFunds,
  resetDemoWallet,
  WalletStats,
  DemoTransactionRecord,
} from '@/services/database';
import { DemoBadge } from './DemoBadge';

interface BalanceManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onBalanceUpdated: (newBalance: number) => void;
}

export function BalanceManagementModal({
  visible,
  onClose,
  onBalanceUpdated,
}: BalanceManagementModalProps) {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [amountStr, setAmountStr] = useState<string>('1000');
  const [note, setNote] = useState<string>('Simulated cash deposit');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<DemoTransactionRecord | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load stats from SQLite
  const loadStats = useCallback(async () => {
    try {
      const s = await getWalletStats();
      setStats(s);
    } catch {
      // Fail-safe
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadStats();
      setShowSuccessCard(false);
      setCompletedTxn(null);
      setShowResetConfirm(false);
      setAmountStr('1000');
      setNote('Simulated cash deposit');
    }
  }, [visible, loadStats]);

  // Handle hardware back
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (showResetConfirm) {
        setShowResetConfirm(false);
        return true;
      }
      if (showSuccessCard) {
        setShowSuccessCard(false);
        loadStats();
        return true;
      }
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [visible, showResetConfirm, showSuccessCard, onClose, loadStats]);

  const parsedAmount = useMemo(() => {
    const val = parseFloat(amountStr);
    return isNaN(val) ? 0 : val;
  }, [amountStr]);

  const isAmountValid = parsedAmount > 0 && parsedAmount <= 500000;

  // Handle Top-Up
  const handleTopUp = async () => {
    if (!isAmountValid || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await addDemoFunds(parsedAmount, note.trim() || 'Demo Top-Up');
      setCompletedTxn(res.transaction);
      setSuccessMessage(`Added ₹${parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to Demo Wallet`);
      setShowSuccessCard(true);
      onBalanceUpdated(res.newBalance);
      await loadStats();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Top-up failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reset Wallet
  const handleExecuteReset = async () => {
    setIsProcessing(true);
    setShowResetConfirm(false);

    try {
      const res = await resetDemoWallet();
      setSuccessMessage('Demo Wallet has been reset to default ₹24,850.00');
      setCompletedTxn(null);
      setShowSuccessCard(true);
      onBalanceUpdated(res.newBalance);
      await loadStats();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Reset failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Manage Demo Balance</Text>
            <DemoBadge label="SIMULATED" />
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Global Warning Banner */}
        <View style={styles.disclaimerStrip}>
          <Ionicons name="information-circle" size={16} color={Colors.warning} />
          <Text style={styles.disclaimerText}>
            DEMO FUNDS ONLY — NO FINANCIAL VALUE • Offline SQLite Engine
          </Text>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* SUCCESS RECEIPT OVERLAY / CARD */}
          {showSuccessCard ? (
            <View style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-sharp" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Transaction Successful</Text>
              <Text style={styles.successSubtitle}>{successMessage}</Text>

              {stats && (
                <View style={styles.updatedBalanceBox}>
                  <Text style={styles.updatedBalanceLabel}>Current Available Balance</Text>
                  <Text style={styles.updatedBalanceValue}>
                    ₹{stats.currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowSuccessCard(false)}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* BALANCE & STATS SUMMARY CARD */}
              <View style={styles.overviewCard}>
                <Text style={styles.overviewLabel}>Current Demo Balance</Text>
                <Text style={styles.overviewAmount}>
                  ₹
                  {stats
                    ? stats.currentBalance.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })
                    : '24,850.00'}
                </Text>

                <View style={styles.statsDivider} />

                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Total Deposited</Text>
                    <Text style={[styles.statValue, { color: Colors.success }]}>
                      +₹{stats ? stats.totalCredited.toLocaleString('en-IN') : '0'}
                    </Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Simulated Spent</Text>
                    <Text style={[styles.statValue, { color: Colors.warning }]}>
                      -₹{stats ? stats.totalDebited.toLocaleString('en-IN') : '0'}
                    </Text>
                  </View>

                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Total Txns</Text>
                    <Text style={styles.statValue}>
                      {stats ? stats.transactionCount : '0'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* QUICK TOP-UP SECTION */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Add Simulated Funds</Text>
                </View>

                {/* Quick Selection Chips */}
                <Text style={styles.inputSubLabel}>Select Amount</Text>
                <View style={styles.chipsRow}>
                  {[500, 1000, 5000, 10000].map((amt) => {
                    const isSelected = parsedAmount === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.chipButton, isSelected && styles.chipButtonActive]}
                        onPress={() => setAmountStr(amt.toString())}>
                        <Text
                          style={[
                            styles.chipButtonText,
                            isSelected && styles.chipButtonTextActive,
                          ]}>
                          +₹{amt.toLocaleString('en-IN')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Amount Field */}
                <Text style={[styles.inputSubLabel, { marginTop: 14 }]}>
                  Custom Amount (₹)
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter custom amount"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={amountStr}
                  onChangeText={(t) => setAmountStr(t.replace(/[^0-9.]/g, ''))}
                />

                {/* Purpose Note */}
                <Text style={[styles.inputSubLabel, { marginTop: 12 }]}>
                  Purpose / Deposit Note
                </Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="e.g. Salary, Project milestone, Cash gift"
                  placeholderTextColor={Colors.textTertiary}
                  value={note}
                  onChangeText={setNote}
                  maxLength={40}
                />

                {/* Top-Up Action Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, !isAmountValid && styles.primaryButtonDisabled]}
                  disabled={!isAmountValid || isProcessing}
                  onPress={handleTopUp}>
                  {isProcessing ? (
                    <ActivityIndicator color={Colors.textInverse} />
                  ) : (
                    <>
                      <Ionicons name="wallet-outline" size={18} color={Colors.textInverse} />
                      <Text style={styles.primaryButtonText}>
                        Deposit ₹{parsedAmount.toLocaleString('en-IN')} Demo Funds
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* RESET WALLET SECTION */}
              <View style={styles.resetCard}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="refresh-circle-outline" size={20} color={Colors.danger} />
                  <Text style={[styles.sectionTitle, { color: Colors.danger }]}>
                    Reset Demo Wallet
                  </Text>
                </View>

                <Text style={styles.resetDescription}>
                  Restores your local SQLite demo balance to the default initial value of
                  ₹24,850.00 and logs a system reset event.
                </Text>

                {showResetConfirm ? (
                  <View style={styles.confirmBox}>
                    <Text style={styles.confirmTitle}>Are you sure you want to reset?</Text>
                    <Text style={styles.confirmSub}>
                      This only affects the offline demo simulator database on this phone.
                    </Text>

                    <View style={styles.confirmButtonsRow}>
                      <TouchableOpacity
                        style={styles.cancelConfirmBtn}
                        onPress={() => setShowResetConfirm(false)}>
                        <Text style={styles.cancelConfirmBtnText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.destructiveConfirmBtn}
                        onPress={handleExecuteReset}>
                        <Text style={styles.destructiveConfirmBtnText}>Confirm Reset</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setShowResetConfirm(true)}>
                    <Ionicons name="refresh-outline" size={16} color={Colors.danger} />
                    <Text style={styles.resetButtonText}>Reset to ₹24,850.00</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Security Watermark */}
              <View style={styles.watermarkCard}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.warning} />
                <Text style={styles.watermarkText}>
                  SIMULATED — NO REAL MONEY TRANSFERRED.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  disclaimerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.25)',
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600',
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xxl * 2,
  },
  overviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%',
    marginVertical: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  chipButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipButtonActive: {
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderColor: Colors.primary,
  },
  chipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  amountInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  noteInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  resetCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: Spacing.lg,
  },
  resetDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  resetButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  confirmSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelConfirmBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  destructiveConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.danger,
  },
  destructiveConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  watermarkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: Spacing.lg,
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.warning,
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  updatedBalanceBox: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    width: '100%',
    marginBottom: Spacing.md,
  },
  updatedBalanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  updatedBalanceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
});
