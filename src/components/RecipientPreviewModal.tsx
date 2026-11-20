import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { AppContact, ContactPhoneNumber, maskPhoneNumber } from '@/services/contacts';

interface RecipientPreviewModalProps {
  visible: boolean;
  contact: AppContact | null;
  selectedPhone: ContactPhoneNumber | null;
  onSelectPhone: (phone: ContactPhoneNumber) => void;
  onClose: () => void;
  onContinue: (contact: AppContact, phone: ContactPhoneNumber) => void;
}

export function RecipientPreviewModal({
  visible,
  contact,
  selectedPhone,
  onSelectPhone,
  onClose,
  onContinue,
}: RecipientPreviewModalProps) {
  if (!contact) return null;

  const activePhone = selectedPhone || contact.phoneNumbers[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessibilityLabel="Back">
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Recipient Preview</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Contact Avatar & Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{contact.initials}</Text>
              </View>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.selectedNumber}>
                {maskPhoneNumber(activePhone?.formattedNumber || contact.primaryPhone)}
              </Text>
            </View>

            {/* Multiple Phone Numbers Selection (if applicable) */}
            {contact.phoneNumbers.length > 1 && (
              <View style={styles.phoneListSection}>
                <Text style={styles.sectionHeading}>Select Phone Number</Text>
                {contact.phoneNumbers.map((phone, idx) => {
                  const isSelected =
                    phone.formattedNumber === activePhone?.formattedNumber;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.phoneOption,
                        isSelected && styles.phoneOptionSelected,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => onSelectPhone(phone)}>
                      <View style={styles.phoneDetails}>
                        <Text
                          style={[
                            styles.phoneLabel,
                            isSelected && styles.phoneLabelSelected,
                          ]}>
                          {phone.label.toUpperCase()}
                        </Text>
                        <Text style={styles.phoneNumberText}>
                          {maskPhoneNumber(phone.formattedNumber)}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={isSelected ? Colors.primary : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Simulation Warning Note */}
            <View style={styles.simulationBanner}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <View style={styles.simulationTextContainer}>
                <Text style={styles.simulationTitle}>Demo Simulation Only</Text>
                <Text style={styles.simulationBody}>
                  No real funds will be transferred or bank accounts charged.
                  Recipients will not receive actual messages or requests.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.8}
              onPress={() => activePhone && onContinue(contact, activePhone)}>
              <Text style={styles.continueText}>Continue to Demo Pay</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.title1,
    fontSize: 28,
    color: Colors.primary,
  },
  contactName: {
    ...Typography.title2,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedNumber: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  phoneListSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeading: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  phoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phoneOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(11, 87, 208, 0.08)',
  },
  phoneDetails: {
    flex: 1,
  },
  phoneLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  phoneLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  phoneNumberText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  simulationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(11, 87, 208, 0.06)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(11, 87, 208, 0.2)',
  },
  simulationTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  simulationTitle: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  simulationBody: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  continueText: {
    ...Typography.button,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});
