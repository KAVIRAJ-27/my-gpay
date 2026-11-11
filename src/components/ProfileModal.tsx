import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { USER_PROFILE } from '@/data/mockData';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLock: () => void;
}

export function ProfileModal({ visible, onClose, onLock }: ProfileModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Avatar and Name */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER_PROFILE.name.charAt(0)}</Text>
          </View>

          <Text style={styles.userName}>{USER_PROFILE.fullName}</Text>
          <Text style={styles.userUpi}>{USER_PROFILE.upiId}</Text>
          <Text style={styles.userPhone}>{USER_PROFILE.phoneMasked}</Text>

          <View style={styles.divider} />

          {/* Account Info */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Demo Bank:</Text>
            <Text style={styles.infoValue}>{USER_PROFILE.bankName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Simulated Account:</Text>
            <Text style={styles.infoValue}>{USER_PROFILE.accountNumberMasked}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Security Level:</Text>
            <Text style={[styles.infoValue, { color: Colors.success }]}>
              TEE Keyguard Verified
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Lock Simulator Button */}
          <TouchableOpacity
            style={[CommonStyles.secondaryButton, styles.lockButton]}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onLock();
            }}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={Colors.danger}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.lockButtonText}>Lock Simulator</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeLink} onPress={onClose}>
            <Text style={styles.closeLinkText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  userName: {
    ...Typography.title1,
    color: Colors.textPrimary,
  },
  userUpi: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lockButton: {
    width: '100%',
    borderColor: Colors.dangerBorder,
    backgroundColor: Colors.dangerSurface,
    marginTop: Spacing.xs,
  },
  lockButtonText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  closeLink: {
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  closeLinkText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
