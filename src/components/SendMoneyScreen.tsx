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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { AppContact, ContactPhoneNumber, maskPhoneNumber } from '@/services/contacts';
import {
  executeDemoTransfer,
  DemoTransactionRecord,
  formatTimestamp,
} from '@/services/database';
import { DemoBadge } from './DemoBadge';
import { NumericKeypad } from './NumericKeypad';

type SendMoneyStep = 'amount' | 'review' | 'confirm' | 'result';

interface SendMoneyScreenProps {
  visible: boolean;
  recipient: AppContact | null;
  initialPhone?: ContactPhoneNumber | null;
  currentBalance: number;
  onClose: () => void;
  onChangeRecipient: () => void;
  onTransactionSuccess: (newBalance: number) => void;
}

export function SendMoneyScreen({
  visible,
  recipient,
  initialPhone,
  currentBalance,
  onClose,
  onChangeRecipient,
  onTransactionSuccess,
}: SendMoneyScreenProps) {
  // Navigation step within the Send Money flow
  const [currentStep, setCurrentStep] = useState<SendMoneyStep>('amount');

  // Input states (preserved throughout the flow)
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<ContactPhoneNumber | null>(
    initialPhone || null
  );

  // Phone selector dropdown / modal state for multi-phone contacts
  const [showPhoneSelector, setShowPhoneSelector] = useState(false);

  // Execution & Duplicate protection states
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<DemoTransactionRecord | null>(null);
  const [postTxnBalance, setPostTxnBalance] = useState<number>(currentBalance);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial phone when recipient changes
  useEffect(() => {
    if (recipient) {
      if (initialPhone) {
        setSelectedPhone(initialPhone);
      } else if (recipient.phoneNumbers && recipient.phoneNumbers.length > 0) {
        setSelectedPhone(recipient.phoneNumbers[0]);
      }
    }
  }, [recipient, initialPhone]);

  // Reset or initialize step when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentStep('amount');
      setIsProcessing(false);
      setCompletedTxn(null);
      setErrorMessage(null);
    }
  }, [visible]);

  // Handle hardware back button
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      if (showPhoneSelector) {
        setShowPhoneSelector(false);
        return true;
      }
      if (isProcessing) {
        return true; // Ignore back presses during atomic execution
      }
      if (currentStep === 'result') {
        onClose();
        return true;
      }
      if (currentStep === 'confirm') {
        setCurrentStep('review');
        return true;
      }
      if (currentStep === 'review') {
        setCurrentStep('amount');
        return true;
      }
      if (currentStep === 'amount') {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backHandler.remove();
  }, [visible, currentStep, showPhoneSelector, isProcessing, onClose]);

  // Amount parsing and validation
  const parsedAmount = useMemo(() => {
    const val = parseFloat(amountStr);
    return isNaN(val) ? 0 : val;
  }, [amountStr]);

  const MAX_DEMO_LIMIT = 100000; // ₹1,00,000 maximum demo limit

  const isAmountValid = useMemo(() => {
    if (!amountStr || amountStr === '0' || amountStr === '0.') return false;
    if (amountStr.endsWith('.')) return false;
    return parsedAmount > 0 && parsedAmount <= MAX_DEMO_LIMIT;
  }, [amountStr, parsedAmount]);

  const validationMessage = useMemo(() => {
    if (!amountStr) return null;
    if (parsedAmount > MAX_DEMO_LIMIT) {
      return 'Maximum demo transaction limit is ₹1,00,000';
    }
    if (amountStr === '0') {
      return 'Amount must be greater than ₹0';
    }
    return null;
  }, [amountStr, parsedAmount]);

  // Keypad Handlers
  const handleDigitPress = (digit: string) => {
    setAmountStr((prev) => {
      if (prev === '0') return digit;
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) return prev;
      } else {
        if (prev.length >= 6) return prev;
      }
      return prev + digit;
    });
  };

  const handleDecimalPress = () => {
    setAmountStr((prev) => {
      if (prev === '') return '0.';
      if (prev.includes('.')) return prev;
      return prev + '.';
    });
  };

  const handleBackspacePress = () => {
    setAmountStr((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
    });
  };

  const handleClearPress = () => {
    setAmountStr('');
  };

  const handleQuickAmountPress = (addVal: number) => {
    setAmountStr((prev) => {
      const current = parseFloat(prev || '0');
      const next = Math.min(MAX_DEMO_LIMIT, current + addVal);
      return next.toString();
    });
  };

  // Perform atomic demo transfer execution
  const handleExecuteTransfer = async () => {
    if (isProcessing) return; // Prevent double taps
    if (!recipient) return;

    if (parsedAmount > currentBalance) {
      setErrorMessage(
        `Insufficient demo balance! You have ₹${currentBalance.toLocaleString(
          'en-IN',
          { minimumFractionDigits: 2 }
        )} but tried to send ₹${parsedAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const activePhone =
        selectedPhone ||
        (recipient.phoneNumbers && recipient.phoneNumbers[0]) ||
        { formattedNumber: recipient.primaryPhone, label: 'mobile' };

      const res = await executeDemoTransfer({
        recipientName: recipient.name,
        recipientPhoneMasked: maskPhoneNumber(activePhone.formattedNumber),
        amount: parsedAmount,
        note: note.trim(),
      });

      setCompletedTxn(res.transaction);
      setPostTxnBalance(res.newBalance);
      onTransactionSuccess(res.newBalance);
      setCurrentStep('result');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Local simulated transfer failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const noteSuggestions = ['Lunch', 'Travel', 'Books', 'Gift'];

  if (!recipient) return null;

  const activePhone =
    selectedPhone ||
    (recipient.phoneNumbers && recipient.phoneNumbers[0]) ||
    { label: 'mobile', number: recipient.primaryPhone, formattedNumber: recipient.primaryPhone };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* ================= STEP 1: AMOUNT ENTRY SCREEN ================= */}
        {currentStep === 'amount' && (
          <View style={styles.screenContainer}>
            {/* Top Navigation Bar */}
            <View style={styles.navHeader}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.navIconButton}
                activeOpacity={0.7}
                accessibilityLabel="Go back">
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>

              <DemoBadge />

              <TouchableOpacity
                onPress={onChangeRecipient}
                style={styles.changeContactBtn}
                activeOpacity={0.7}
                accessibilityLabel="Change recipient">
                <Text style={styles.changeContactText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Recipient Information Header */}
            <View style={styles.recipientHeaderCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{recipient.initials}</Text>
              </View>

              <View style={styles.recipientDetails}>
                <Text style={styles.recipientName} numberOfLines={1}>
                  {recipient.name}
                </Text>

                {recipient.phoneNumbers && recipient.phoneNumbers.length > 1 ? (
                  <TouchableOpacity
                    style={styles.multiPhoneTrigger}
                    onPress={() => setShowPhoneSelector(true)}
                    activeOpacity={0.7}
                    accessibilityLabel="Select phone number">
                    <Text style={styles.recipientPhone}>
                      {maskPhoneNumber(activePhone.formattedNumber)}
                    </Text>
                    <View style={styles.phoneBadge}>
                      <Text style={styles.phoneBadgeText}>
                        {activePhone.label.toUpperCase()}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={12}
                        color={Colors.primary}
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.recipientPhone}>
                    {maskPhoneNumber(activePhone.formattedNumber)}
                  </Text>
                )}
              </View>
            </View>

            {/* Middle Section: Amount Display & Note */}
            <ScrollView
              style={styles.middleScroll}
              contentContainerStyle={styles.middleScrollContent}
              keyboardShouldPersistTaps="handled">
              {/* Large Amount Display */}
              <View style={styles.amountDisplayArea}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Text
                  style={[
                    styles.amountText,
                    amountStr.length === 0 && styles.amountPlaceholder,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit>
                  {amountStr.length > 0 ? amountStr : '0'}
                </Text>
              </View>

              {/* Validation Warning */}
              {validationMessage && (
                <View style={styles.warningContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={Colors.warning}
                  />
                  <Text style={styles.warningText}>{validationMessage}</Text>
                </View>
              )}

              {/* Available Demo Balance Indicator */}
              <View style={styles.balanceRow}>
                <Ionicons
                  name="wallet-outline"
                  size={15}
                  color={Colors.textTertiary}
                />
                <Text style={styles.balanceText}>
                  Simulated Balance: ₹
                  {currentBalance.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              {/* Optional Note Field */}
              <View style={styles.noteContainer}>
                <View style={styles.noteInputWrapper}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={18}
                    color={Colors.textTertiary}
                    style={styles.noteIcon}
                  />
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add a note (e.g., Lunch, Travel)"
                    placeholderTextColor={Colors.textTertiary}
                    value={note}
                    onChangeText={(text) => setNote(text.slice(0, 50))}
                    maxLength={50}
                    returnKeyType="done"
                  />
                  {note.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setNote('')}
                      style={styles.noteClearBtn}
                      activeOpacity={0.7}>
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Note Suggestions & Character Limit */}
                <View style={styles.noteFooter}>
                  <View style={styles.noteSuggestions}>
                    {noteSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item}
                        style={[
                          styles.noteSuggestionChip,
                          note === item && styles.noteSuggestionChipActive,
                        ]}
                        onPress={() => setNote(item)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.noteSuggestionText,
                            note === item && styles.noteSuggestionTextActive,
                          ]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.charCounter}>{note.length}/50</Text>
                </View>
              </View>
            </ScrollView>

            {/* Custom Numeric Keypad */}
            <NumericKeypad
              onDigitPress={handleDigitPress}
              onDecimalPress={handleDecimalPress}
              onBackspacePress={handleBackspacePress}
              onClearPress={handleClearPress}
              onQuickAmountPress={handleQuickAmountPress}
            />

            {/* Bottom Continue Button */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !isAmountValid && styles.continueButtonDisabled,
                ]}
                disabled={!isAmountValid}
                onPress={() => setCurrentStep('review')}
                activeOpacity={0.8}
                accessibilityLabel="Continue to review transfer">
                <Text
                  style={[
                    styles.continueButtonText,
                    !isAmountValid && styles.continueButtonTextDisabled,
                  ]}>
                  Continue to Review
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isAmountValid ? Colors.textInverse : Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 2: REVIEW SCREEN ================= */}
        {currentStep === 'review' && (
          <View style={styles.screenContainer}>
            {/* Header */}
            <View style={styles.navHeader}>
              <TouchableOpacity
                onPress={() => setCurrentStep('amount')}
                style={styles.navIconButton}
                activeOpacity={0.7}
                accessibilityLabel="Back to amount entry">
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Review Transfer</Text>
              <DemoBadge />
            </View>

            <ScrollView
              style={styles.reviewScroll}
              contentContainerStyle={styles.reviewContent}>
              {/* Recipient Card */}
              <View style={styles.reviewCard}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{recipient.initials}</Text>
                </View>
                <Text style={styles.reviewRecipientName}>{recipient.name}</Text>
                <Text style={styles.reviewRecipientPhone}>
                  {maskPhoneNumber(activePhone.formattedNumber)}
                </Text>
                <View style={styles.reviewAmountRow}>
                  <Text style={styles.reviewAmountSymbol}>₹</Text>
                  <Text style={styles.reviewAmountText}>
                    {parsedAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              </View>

              {/* Transaction Details Breakdown */}
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <View style={styles.detailValueRow}>
                    <Ionicons
                      name="wallet-outline"
                      size={16}
                      color={Colors.primary}
                    />
                    <Text style={styles.detailValue}>G Pay.nu Demo Wallet</Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Demo Balance Reference</Text>
                  <Text style={styles.detailValue}>
                    ₹
                    {currentBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Note / Purpose</Text>
                  <Text style={styles.detailValue}>
                    {note.trim().length > 0 ? note : 'None'}
                  </Text>
                </View>

                <View style={styles.detailDivider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction Type</Text>
                  <Text style={styles.detailValue}>Simulated P2P Transfer</Text>
                </View>
              </View>

              {/* Prominent Demo Simulation Disclaimer */}
              <View style={styles.disclaimerCard}>
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={Colors.primary}
                />
                <View style={styles.disclaimerTextContainer}>
                  <Text style={styles.disclaimerTitle}>
                    Independent Demo Wallet Simulator
                  </Text>
                  <Text style={styles.disclaimerBody}>
                    This application is strictly a local demo environment. No
                    actual payment gateway, UPI ID, or banking network is
                    connected. No real funds will move.
                  </Text>
                </View>
              </View>

              {/* Edit Amount & Note Button */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setCurrentStep('amount')}
                activeOpacity={0.7}
                accessibilityLabel="Edit amount or note">
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
                <Text style={styles.editText}>Edit Amount & Note</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Continue to Demo Simulation */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => setCurrentStep('confirm')}
                activeOpacity={0.8}
                accessibilityLabel="Continue to Demo Simulation">
                <Text style={styles.continueButtonText}>
                  Continue to Demo Simulation
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.textInverse}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 3: CONFIRMATION SCREEN ================= */}
        {currentStep === 'confirm' && (
          <View style={styles.screenContainer}>
            <View style={styles.navHeader}>
              <TouchableOpacity
                onPress={() => !isProcessing && setCurrentStep('review')}
                style={styles.navIconButton}
                activeOpacity={0.7}
                disabled={isProcessing}
                accessibilityLabel="Back to review">
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Confirm Simulation</Text>
              <DemoBadge />
            </View>

            <ScrollView
              style={styles.reviewScroll}
              contentContainerStyle={styles.confirmContent}>
              {/* Critical Simulation Warning Banner */}
              <View style={styles.confirmWarningBox}>
                <Ionicons
                  name="alert-circle"
                  size={32}
                  color={Colors.warning}
                  style={{ alignSelf: 'center', marginBottom: Spacing.sm }}
                />
                <Text style={styles.confirmWarningTitle}>
                  DEMO SIMULATION ONLY
                </Text>
                <Text style={styles.confirmWarningText}>
                  Nothing will be transferred.{'\n'}
                  No bank or UPI service is connected.{'\n'}
                  This will update your local demo wallet only.
                </Text>
              </View>

              {/* Transfer Summary */}
              <View style={styles.confirmSummaryCard}>
                <Text style={styles.confirmSummaryHeading}>
                  Simulated Transaction Summary
                </Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Recipient</Text>
                  <Text style={styles.summaryValue}>{recipient.name}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Masked Phone</Text>
                  <Text style={styles.summaryValue}>
                    {maskPhoneNumber(activePhone.formattedNumber)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount to Deduct</Text>
                  <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                    - ₹
                    {parsedAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                {note.trim().length > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Note</Text>
                    <Text style={styles.summaryValue}>{note}</Text>
                  </View>
                )}

                <View style={styles.detailDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Current Demo Balance</Text>
                  <Text style={styles.summaryValue}>
                    ₹
                    {currentBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Projected Balance</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color:
                          currentBalance - parsedAmount < 0
                            ? Colors.danger
                            : Colors.success,
                      },
                    ]}>
                    ₹
                    {Math.max(0, currentBalance - parsedAmount).toLocaleString(
                      'en-IN',
                      { minimumFractionDigits: 2 }
                    )}
                  </Text>
                </View>
              </View>

              {/* Insufficient Balance Error (if any) */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="close-circle" size={20} color={Colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
            </ScrollView>

            {/* Confirmation Actions */}
            <View style={styles.confirmBottomBar}>
              <TouchableOpacity
                style={[
                  styles.confirmExecuteBtn,
                  (isProcessing || parsedAmount > currentBalance) &&
                    styles.confirmExecuteBtnDisabled,
                ]}
                disabled={isProcessing || parsedAmount > currentBalance}
                onPress={handleExecuteTransfer}
                activeOpacity={0.8}
                accessibilityLabel="Confirm Demo Transfer">
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Colors.textInverse} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.textInverse}
                    />
                    <Text style={styles.confirmExecuteBtnText}>
                      Confirm Demo Transfer
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                disabled={isProcessing}
                onPress={() => setCurrentStep('review')}
                activeOpacity={0.7}
                accessibilityLabel="Cancel transfer">
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ================= STEP 4: COMPLETED RESULT SCREEN ================= */}
        {currentStep === 'result' && completedTxn && (
          <View style={styles.screenContainer}>
            {/* Header */}
            <View style={styles.navHeader}>
              <View style={{ width: 40 }} />
              <Text style={styles.navTitle}>Transfer Result</Text>
              <DemoBadge />
            </View>

            <ScrollView
              style={styles.reviewScroll}
              contentContainerStyle={styles.resultScrollContent}>
              {/* Success Badge */}
              <View style={styles.resultBadgeContainer}>
                <View style={styles.resultCheckCircle}>
                  <Ionicons name="checkmark" size={48} color={Colors.brandNu} />
                </View>
                <Text style={styles.resultSuccessTitle}>
                  DEMO TRANSACTION COMPLETED
                </Text>
              </View>

              {/* Watermark Banner */}
              <View style={styles.watermarkBanner}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.watermarkText}>
                  SIMULATED — NO REAL MONEY TRANSFERRED
                </Text>
              </View>

              {/* Completed Details Card */}
              <View style={styles.resultDetailsCard}>
                <View style={styles.resultAmountRow}>
                  <Text style={styles.resultAmountSymbol}>₹</Text>
                  <Text style={styles.resultAmountText}>
                    {completedTxn.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                <Text style={styles.resultToText}>
                  Sent to {completedTxn.recipient_name}
                </Text>
                <Text style={styles.resultPhoneText}>
                  {completedTxn.recipient_phone_masked}
                </Text>

                <View style={styles.detailDivider} />

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Simulated Time</Text>
                  <Text style={styles.resultValue}>
                    {completedTxn.created_at_formatted}
                  </Text>
                </View>

                {completedTxn.note.trim().length > 0 && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Note</Text>
                    <Text style={styles.resultValue}>{completedTxn.note}</Text>
                  </View>
                )}

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Updated Demo Balance</Text>
                  <Text style={[styles.resultValue, { color: Colors.primary }]}>
                    ₹
                    {postTxnBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                <View style={styles.detailDivider} />

                {/* Local Demo Record ID Box */}
                <View style={styles.recordIdContainer}>
                  <Text style={styles.recordIdLabel}>
                    LOCAL DEMO RECORD ID:
                  </Text>
                  <Text style={styles.recordIdText}>{completedTxn.id}</Text>
                  <Text style={styles.recordIdDisclaimer}>
                    Local demo record ID — not a payment reference.
                  </Text>
                </View>
              </View>

              {/* Educational Disclaimer */}
              <View style={styles.safeNoticeCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
                <Text style={styles.safeNoticeText}>
                  This record is stored exclusively in your device's local SQLite
                  database. No banks, NPCI, or financial entities received this
                  data.
                </Text>
              </View>
            </ScrollView>

            {/* Bottom Done Action */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onClose}
                activeOpacity={0.8}
                accessibilityLabel="Return to Home Dashboard">
                <Text style={styles.continueButtonText}>
                  Return to Home Dashboard
                </Text>
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={Colors.textInverse}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Multi-phone Selector Modal */}
        {recipient.phoneNumbers && recipient.phoneNumbers.length > 1 && (
          <Modal
            visible={showPhoneSelector}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPhoneSelector(false)}>
            <TouchableOpacity
              style={styles.selectorBackdrop}
              activeOpacity={1}
              onPress={() => setShowPhoneSelector(false)}>
              <View style={styles.selectorSheet}>
                <Text style={styles.selectorTitle}>Select Phone Number</Text>
                {recipient.phoneNumbers.map((phone, idx) => {
                  const isSelected =
                    phone.formattedNumber === activePhone.formattedNumber;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.selectorOption,
                        isSelected && styles.selectorOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedPhone(phone);
                        setShowPhoneSelector(false);
                      }}
                      activeOpacity={0.7}>
                      <View>
                        <Text style={styles.selectorOptionLabel}>
                          {phone.label.toUpperCase()}
                        </Text>
                        <Text style={styles.selectorOptionNumber}>
                          {maskPhoneNumber(phone.formattedNumber)}
                        </Text>
                      </View>
                      <Ionicons
                        name={
                          isSelected ? 'radio-button-on' : 'radio-button-off'
                        }
                        size={20}
                        color={isSelected ? Colors.primary : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableOpacity>
          </Modal>
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
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navIconButton: {
    padding: Spacing.xs,
  },
  navTitle: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  changeContactBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(11, 87, 208, 0.25)',
  },
  changeContactText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Recipient Header Card
  recipientHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.primary,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    ...Typography.title2,
    fontSize: 17,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  recipientPhone: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  multiPhoneTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    gap: 2,
  },
  phoneBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Middle Content: Amount & Note
  middleScroll: {
    flex: 1,
  },
  middleScrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  amountDisplayArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    height: 60,
  },
  currencySymbol: {
    ...Typography.hero,
    fontSize: 38,
    color: Colors.primary,
    marginRight: 6,
    fontWeight: '700',
  },
  amountText: {
    ...Typography.hero,
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  amountPlaceholder: {
    color: Colors.textTertiary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginBottom: Spacing.xs,
    gap: 6,
  },
  warningText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.warning,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  balanceText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textTertiary,
  },

  // Note Container
  noteContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  noteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  noteIcon: {
    marginRight: Spacing.sm,
  },
  noteInput: {
    flex: 1,
    height: 38,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  noteClearBtn: {
    padding: 4,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  noteSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  noteSuggestionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  noteSuggestionChipActive: {
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  noteSuggestionText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  noteSuggestionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  charCounter: {
    fontSize: 11,
    color: Colors.textTertiary,
  },

  // Bottom Action Bar
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.surfaceVariant,
  },
  continueButtonText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  continueButtonTextDisabled: {
    color: Colors.textTertiary,
  },

  // Review Screen Styles
  reviewScroll: {
    flex: 1,
  },
  reviewContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  reviewCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  reviewAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  reviewAvatarText: {
    ...Typography.title1,
    fontSize: 24,
    color: Colors.primary,
  },
  reviewRecipientName: {
    ...Typography.title1,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  reviewRecipientPhone: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  reviewAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAmountSymbol: {
    ...Typography.title1,
    fontSize: 28,
    color: Colors.primary,
    marginRight: 4,
  },
  reviewAmountText: {
    ...Typography.hero,
    fontSize: 38,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailValue: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(11, 87, 208, 0.25)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  disclaimerBody: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  editText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },

  // Confirmation Step Styles
  confirmContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  confirmWarningBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1.5,
    borderColor: Colors.warning,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  confirmWarningTitle: {
    ...Typography.title2,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.warning,
    marginBottom: 6,
  },
  confirmWarningText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmSummaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: 8,
  },
  confirmSummaryHeading: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 8,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.danger,
    flex: 1,
  },
  confirmBottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  confirmExecuteBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmExecuteBtnDisabled: {
    backgroundColor: Colors.surfaceVariant,
  },
  confirmExecuteBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.textInverse,
    fontWeight: '800',
  },
  cancelBtn: {
    height: 44,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
  },

  // Completed Result Screen Styles
  resultScrollContent: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  resultBadgeContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  resultCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 231, 195, 0.15)',
    borderWidth: 2,
    borderColor: Colors.brandNu,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  resultSuccessTitle: {
    ...Typography.title1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.brandNu,
    letterSpacing: 0.5,
  },
  watermarkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: 8,
  },
  watermarkText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  resultDetailsCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  resultAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resultAmountSymbol: {
    ...Typography.title1,
    fontSize: 28,
    color: Colors.textPrimary,
    marginRight: 4,
  },
  resultAmountText: {
    ...Typography.hero,
    fontSize: 40,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resultToText: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  resultPhoneText: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  resultRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resultLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  recordIdContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  recordIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  recordIdText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  recordIdDisclaimer: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  safeNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 8,
  },
  safeNoticeText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },

  // Selector Sheet Modal
  selectorBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  selectorSheet: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
  },
  selectorTitle: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectorOptionActive: {
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
  },
  selectorOptionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  selectorOptionNumber: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
});
