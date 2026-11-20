import React, { useState, useEffect, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { executeDemoTransfer, DemoTransactionRecord, formatTimestamp } from '@/services/database';
import { getActivePIN } from '@/services/auth';
import { DemoBadge } from './DemoBadge';
import { NumericKeypad } from './NumericKeypad';

type BankStep = 'form' | 'review' | 'pin' | 'result';

interface BankTransferModalProps {
  visible: boolean;
  currentBalance: number;
  onClose: () => void;
  onTransferSuccess: (newBalance: number) => void;
}

// Known bank prefixes for mock IFSC resolution
const KNOWN_BANKS: Record<string, string> = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  UTIB: 'Axis Bank',
  AXIS: 'Axis Bank',
  PUNB: 'Punjab National Bank',
  BARB: 'Bank of Baroda',
  KKBK: 'Kotak Mahindra Bank',
  CNRB: 'Canara Bank',
  UBIB: 'Union Bank of India',
  IDIB: 'Indian Bank',
  YESB: 'Yes Bank',
  IBKL: 'IDBI Bank',
  INDN: 'IndusInd Bank',
  IOBA: 'Indian Overseas Bank',
};

export function BankTransferModal({
  visible,
  currentBalance,
  onClose,
  onTransferSuccess,
}: BankTransferModalProps) {
  const [step, setStep] = useState<BankStep>('form');

  // Form states
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');

  // Pin state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Execution states
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<DemoTransactionRecord | null>(null);
  const [postTxnBalance, setPostTxnBalance] = useState<number>(currentBalance);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setStep('form');
      setAccountNumber('');
      setConfirmAccount('');
      setIfsc('');
      setBeneficiaryName('');
      setAmountStr('');
      setNote('');
      setEnteredPin('');
      setPinError(null);
      setIsProcessing(false);
      setCompletedTxn(null);
      setErrorMessage(null);
    }
  }, [visible]);

  // Back button handling
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (isProcessing) return true;
      if (step === 'result') {
        onClose();
        return true;
      }
      if (step === 'pin') {
        setStep('review');
        setEnteredPin('');
        return true;
      }
      if (step === 'review') {
        setStep('form');
        return true;
      }
      if (step === 'form') {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [visible, step, isProcessing, onClose]);

  // IFSC Bank Name resolution
  const resolvedBank = useMemo(() => {
    const clean = ifsc.trim().toUpperCase();
    if (clean.length < 4) return null;
    const prefix = clean.substring(0, 4);
    if (KNOWN_BANKS[prefix]) {
      return KNOWN_BANKS[prefix];
    }
    // IFSC standard regex: 4 letters, 0, 6 alphanumeric
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (ifscRegex.test(clean)) {
      return 'Verified National Bank (Demo Branch)';
    }
    return null;
  }, [ifsc]);

  const isIfscValid = useMemo(() => {
    const clean = ifsc.trim().toUpperCase();
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean);
  }, [ifsc]);

  // Amount parsing
  const parsedAmount = useMemo(() => {
    const val = parseFloat(amountStr);
    return isNaN(val) ? 0 : val;
  }, [amountStr]);

  // Form validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!accountNumber) {
      errors.push('Account number is required');
    } else if (accountNumber.length < 9 || accountNumber.length > 18) {
      errors.push('Account number must be 9-18 digits');
    }

    if (accountNumber && confirmAccount && accountNumber !== confirmAccount) {
      errors.push('Account numbers do not match');
    }

    if (!ifsc) {
      errors.push('IFSC code is required');
    } else if (!isIfscValid) {
      errors.push('Invalid IFSC format (e.g. SBIN0001234)');
    }

    if (!beneficiaryName.trim()) {
      errors.push('Beneficiary name is required');
    }

    if (!parsedAmount || parsedAmount <= 0) {
      errors.push('Enter a valid amount');
    } else if (parsedAmount > currentBalance) {
      errors.push('Amount exceeds available demo balance');
    }

    return errors;
  }, [accountNumber, confirmAccount, ifsc, isIfscValid, beneficiaryName, parsedAmount, currentBalance]);

  const isFormValid = validationErrors.length === 0 && confirmAccount === accountNumber;

  // Masked account number helper
  const maskedAccount = useMemo(() => {
    if (accountNumber.length <= 4) return accountNumber;
    const last4 = accountNumber.slice(-4);
    return `•••• •••• ${last4}`;
  }, [accountNumber]);

  // Quick amount additions
  const handleAddAmount = (add: number) => {
    const current = parsedAmount;
    const next = current + add;
    if (next <= currentBalance) {
      setAmountStr(next.toString());
    } else {
      setAmountStr(currentBalance.toString());
    }
  };

  // Step transitions
  const handleProceedToReview = () => {
    if (isFormValid) {
      setStep('review');
    }
  };

  const handleProceedToPin = () => {
    setEnteredPin('');
    setPinError(null);
    setStep('pin');
  };

  // PIN keypad handling
  const handlePinDigit = (digit: string) => {
    if (isProcessing) return;
    setPinError(null);
    if (enteredPin.length < 4) {
      const next = enteredPin + digit;
      setEnteredPin(next);
      if (next.length === 4) {
        verifyPinAndExecute(next);
      }
    }
  };

  const handlePinBackspace = () => {
    if (isProcessing) return;
    setPinError(null);
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    if (isProcessing) return;
    setPinError(null);
    setEnteredPin('');
  };

  // Verify PIN and Execute Demo Transfer
  const verifyPinAndExecute = async (pin: string) => {
    const activePin = getActivePIN();
    if (pin !== activePin) {
      setPinError(`Incorrect UPI PIN. Use active demo PIN: ${activePin}`);
      setEnteredPin('');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const bankTitle = resolvedBank || 'Demo Bank';
      const result = await executeDemoTransfer({
        recipientName: `${beneficiaryName.trim()} (${bankTitle})`,
        recipientPhoneMasked: `A/C: ${maskedAccount}`,
        amount: parsedAmount,
        note: note.trim() || 'Demo Bank Transfer',
      });

      setCompletedTxn(result.transaction);
      setPostTxnBalance(result.newBalance);
      setStep('result');
      onTransferSuccess(result.newBalance);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction simulation failed');
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
            onPress={() => {
              if (step === 'pin') setStep('review');
              else if (step === 'review') setStep('form');
              else onClose();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons
              name={step === 'result' ? 'close' : 'arrow-back'}
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {step === 'form' && 'Demo Bank Transfer'}
              {step === 'review' && 'Review Transfer'}
              {step === 'pin' && 'Enter UPI PIN'}
              {step === 'result' && 'Transfer Receipt'}
            </Text>
            <DemoBadge label="SIMULATED" />
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Global Demo Disclaimer */}
        <View style={styles.demoDisclaimerStrip}>
          <Ionicons name="information-circle" size={16} color={Colors.warning} />
          <Text style={styles.demoDisclaimerText}>
            DEMO ONLY: No real banking network or fund transfer involved.
          </Text>
        </View>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Balance Badge */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available Demo Balance:</Text>
              <Text style={styles.balanceAmount}>
                ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Beneficiary Account Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 9-18 digit account number"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={(t) => setAccountNumber(t.replace(/\D/g, ''))}
                maxLength={18}
              />
            </View>

            {/* Re-enter Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Re-enter Account Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmAccount && confirmAccount !== accountNumber && styles.inputErrorBorder,
                ]}
                placeholder="Re-enter to confirm account"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={confirmAccount}
                onChangeText={(t) => setConfirmAccount(t.replace(/\D/g, ''))}
                maxLength={18}
              />
              {confirmAccount && confirmAccount !== accountNumber && (
                <Text style={styles.fieldErrorText}>Account numbers do not match</Text>
              )}
            </View>

            {/* IFSC Code */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>IFSC Code *</Text>
                {resolvedBank && (
                  <View style={styles.bankTag}>
                    <Ionicons name="business" size={12} color={Colors.primary} />
                    <Text style={styles.bankTagText} numberOfLines={1}>
                      {resolvedBank}
                    </Text>
                  </View>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. SBIN0001234 or HDFC0000001"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="characters"
                value={ifsc}
                onChangeText={(t) => setIfsc(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={11}
              />
              <Text style={styles.fieldHelperText}>
                Supported demos: SBIN, HDFC, ICIC, UTIB, PUNB, BARB, KKBK, etc.
              </Text>
            </View>

            {/* Beneficiary Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Holder Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full name as per bank records"
                placeholderTextColor={Colors.textTertiary}
                value={beneficiaryName}
                onChangeText={setBeneficiaryName}
              />
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transfer Amount (₹) *</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={amountStr}
                onChangeText={(t) => setAmountStr(t.replace(/[^0-9.]/g, ''))}
              />
              {/* Quick Amount Chips */}
              <View style={styles.chipsRow}>
                {[500, 1000, 2000, 5000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.amountChip}
                    onPress={() => handleAddAmount(amt)}>
                    <Text style={styles.amountChipText}>+₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Optional Purpose / Note */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add a Note / Purpose (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rent, Freelance share, Grocery"
                placeholderTextColor={Colors.textTertiary}
                value={note}
                onChangeText={setNote}
                maxLength={40}
              />
            </View>

            {/* Validation Notice */}
            {validationErrors.length > 0 && accountNumber.length > 0 && (
              <View style={styles.errorNotice}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
                <Text style={styles.errorNoticeText}>{validationErrors[0]}</Text>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
              disabled={!isFormValid}
              onPress={handleProceedToReview}>
              <Text style={styles.primaryButtonText}>Proceed to Review</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 2: REVIEW */}
        {step === 'review' && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.bankIconCircle}>
                  <Ionicons name="business" size={28} color={Colors.primary} />
                </View>
                <Text style={styles.reviewBeneficiary}>{beneficiaryName}</Text>
                <Text style={styles.reviewBankName}>{resolvedBank || 'Simulated Bank'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Account Number</Text>
                <Text style={styles.reviewValue}>{maskedAccount}</Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>IFSC Code</Text>
                <Text style={styles.reviewValue}>{ifsc.toUpperCase()}</Text>
              </View>

              {note ? (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Note</Text>
                  <Text style={styles.reviewValue}>{note}</Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              <View style={styles.reviewRow}>
                <Text style={styles.reviewTotalLabel}>Transfer Amount</Text>
                <Text style={styles.reviewTotalAmount}>
                  ₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Available Demo Balance</Text>
                <Text style={styles.reviewSubValue}>
                  ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Security Notice */}
            <View style={styles.watermarkCard}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.warning} />
              <Text style={styles.watermarkText}>
                SIMULATED — NO REAL MONEY TRANSFERRED. Offline SQLite Demo.
              </Text>
            </View>

            {/* Proceed to PIN */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleProceedToPin}>
              <Text style={styles.primaryButtonText}>
                Pay ₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 3: PIN */}
        {step === 'pin' && (
          <View style={styles.pinContainer}>
            <View style={styles.pinHeader}>
              <Text style={styles.pinTitle}>Enter 4-Digit Demo UPI PIN</Text>
              <Text style={styles.pinSubtitle}>
                Paying {beneficiaryName} ₹
                {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <View style={styles.pinHintBadge}>
                <Ionicons name="key" size={14} color={Colors.primary} />
                <Text style={styles.pinHintText}>Active Demo PIN: {getActivePIN()}</Text>
              </View>
            </View>

            {/* PIN Dots */}
            <View style={styles.pinDotsRow}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDot,
                      filled && styles.pinDotFilled,
                      pinError && styles.pinDotError,
                    ]}
                  />
                );
              })}
            </View>

            {pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}
            {errorMessage && <Text style={styles.pinErrorText}>{errorMessage}</Text>}

            {isProcessing ? (
              <View style={styles.processingBox}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>Processing offline simulation...</Text>
              </View>
            ) : (
              <NumericKeypad
                onDigitPress={handlePinDigit}
                onDecimalPress={() => {}}
                onBackspacePress={handlePinBackspace}
                onClearPress={handlePinClear}
              />
            )}
          </View>
        )}

        {/* STEP 4: RESULT */}
        {step === 'result' && completedTxn && (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.resultScrollContent}>
            <View style={styles.resultCircle}>
              <Ionicons name="checkmark-sharp" size={48} color="#FFFFFF" />
            </View>

            <Text style={styles.resultTitle}>₹{completedTxn.amount.toFixed(2)}</Text>
            <Text style={styles.resultSubtitle}>
              Simulated Bank Transfer Successful
            </Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Beneficiary</Text>
                <Text style={styles.resultValue}>{completedTxn.recipient_name}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Account</Text>
                <Text style={styles.resultValue}>{completedTxn.recipient_phone_masked}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Simulated UTR</Text>
                <Text style={[styles.resultValue, styles.monoText]}>
                  {completedTxn.id.replace('DEMO-TXN-', 'UTR')}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Date & Time</Text>
                <Text style={styles.resultValue}>{completedTxn.created_at_formatted}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>SIMULATED (OFFLINE)</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Remaining Demo Balance</Text>
                <Text style={styles.resultBalanceValue}>
                  ₹{postTxnBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Permanent Watermark */}
            <View style={styles.watermarkCard}>
              <Text style={styles.watermarkText}>
                SIMULATED — NO REAL MONEY TRANSFERRED
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
  demoDisclaimerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.25)',
  },
  demoDisclaimerText: {
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
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputErrorBorder: {
    borderColor: Colors.danger,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  fieldErrorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  fieldHelperText: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  bankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    maxWidth: '65%',
  },
  bankTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  amountChip: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
  },
  amountChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorNoticeText: {
    fontSize: 12,
    color: Colors.danger,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  reviewHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bankIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reviewBeneficiary: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  reviewBankName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  reviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reviewSubValue: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  reviewTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  reviewTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
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
    letterSpacing: 0.5,
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  pinHeader: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.screenPadding,
  },
  pinTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  pinSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  pinHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pinHintText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pinDotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  pinErrorText: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 10,
  },
  processingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  processingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  resultScrollContent: {
    alignItems: 'center',
    padding: Spacing.screenPadding,
    paddingTop: Spacing.xxl,
  },
  resultCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  resultCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  resultLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
    fontSize: 12,
  },
  resultBalanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
