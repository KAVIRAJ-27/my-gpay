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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { AppContact, ContactPhoneNumber, maskPhoneNumber } from '@/services/contacts';
import { USER_PROFILE } from '@/data/mockData';
import { DemoBadge } from './DemoBadge';
import { NumericKeypad } from './NumericKeypad';

type SendMoneyStep = 'amount' | 'review' | 'placeholder';

interface SendMoneyScreenProps {
  visible: boolean;
  recipient: AppContact | null;
  initialPhone?: ContactPhoneNumber | null;
  onClose: () => void;
  onChangeRecipient: () => void;
}

export function SendMoneyScreen({
  visible,
  recipient,
  initialPhone,
  onClose,
  onChangeRecipient,
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
      if (currentStep === 'placeholder') {
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
  }, [visible, currentStep, showPhoneSelector, onClose]);

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
      // If previous was '0' and no decimal point, replace with new digit
      if (prev === '0') {
        return digit;
      }

      // If already contains decimal point, limit to 2 decimal places
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1] && parts[1].length >= 2) {
          return prev; // Max 2 decimal places reached
        }
      } else {
        // Enforce max 6 integer digits (₹1,00,000 max)
        if (prev.length >= 6) {
          return prev;
        }
      }

      return prev + digit;
    });
  };

  const handleDecimalPress = () => {
    setAmountStr((prev) => {
      if (prev === '') return '0.';
      if (prev.includes('.')) return prev; // Avoid duplicate decimal
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

  // Quick note chips
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

                {/* Masked Phone with multi-number dropdown trigger */}
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
                  {USER_PROFILE.demoBalance.toLocaleString('en-IN', {
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
                    {USER_PROFILE.demoBalance.toLocaleString('en-IN', {
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
                onPress={() => setCurrentStep('placeholder')}
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

        {/* ================= STEP 3: SIMULATION PLACEHOLDER SCREEN ================= */}
        {currentStep === 'placeholder' && (
          <View style={styles.screenContainer}>
            {/* Header */}
            <View style={styles.navHeader}>
              <TouchableOpacity
                onPress={() => setCurrentStep('review')}
                style={styles.navIconButton}
                activeOpacity={0.7}
                accessibilityLabel="Back to review">
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>Simulation Milestone</Text>
              <DemoBadge />
            </View>

            <View style={styles.placeholderContainer}>
              {/* Flask / Lab Icon */}
              <View style={styles.placeholderIconContainer}>
                <Ionicons
                  name="construct-outline"
                  size={48}
                  color={Colors.primary}
                />
              </View>

              {/* Phase 6 Milestone Notice */}
              <Text style={styles.placeholderTitle}>Phase 5 Completed</Text>
              <View style={styles.engineNoticeBanner}>
                <Text style={styles.engineNoticeText}>
                  Demo transaction engine will be implemented in Phase 6.
                </Text>
              </View>

              {/* Strict Non-Execution Disclosures */}
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderCardHeading}>
                  Staged Demo Transfer Summary
                </Text>

                <View style={styles.placeholderRow}>
                  <Text style={styles.placeholderLabel}>Recipient:</Text>
                  <Text style={styles.placeholderValue}>{recipient.name}</Text>
                </View>

                <View style={styles.placeholderRow}>
                  <Text style={styles.placeholderLabel}>Masked Phone:</Text>
                  <Text style={styles.placeholderValue}>
                    {maskPhoneNumber(activePhone.formattedNumber)}
                  </Text>
                </View>

                <View style={styles.placeholderRow}>
                  <Text style={styles.placeholderLabel}>Staged Amount:</Text>
                  <Text style={styles.placeholderValue}>
                    ₹
                    {parsedAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </View>

                {note.trim().length > 0 && (
                  <View style={styles.placeholderRow}>
                    <Text style={styles.placeholderLabel}>Note:</Text>
                    <Text style={styles.placeholderValue}>{note}</Text>
                  </View>
                )}

                <View style={styles.placeholderDivider} />

                <View style={styles.integrityItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={Colors.success}
                  />
                  <Text style={styles.integrityText}>
                    Zero real money or bank accounts accessed.
                  </Text>
                </View>
                <View style={styles.integrityItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={Colors.success}
                  />
                  <Text style={styles.integrityText}>
                    No funds deducted from local demo wallet.
                  </Text>
                </View>
                <View style={styles.integrityItem}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color={Colors.success}
                  />
                  <Text style={styles.integrityText}>
                    No fake receipt or deceptive confirmation generated.
                  </Text>
                </View>
              </View>
            </View>

            {/* Bottom Actions */}
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
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteSuggestionChipActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.18)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.15)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.25)',
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
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    gap: 6,
  },
  editText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.primary,
  },

  // Placeholder Screen Styles
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 210, 255, 0.12)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  placeholderTitle: {
    ...Typography.title1,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  engineNoticeBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  engineNoticeText: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
  },
  placeholderCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: 10,
  },
  placeholderCardHeading: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeholderLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  placeholderValue: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  placeholderDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  integrityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  integrityText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  selectorOptionActive: {
    backgroundColor: 'rgba(0, 210, 255, 0.06)',
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
