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
import { QuickActionItem } from '@/data/mockData';

interface ActionPlaceholderModalProps {
  action: QuickActionItem | null;
  visible: boolean;
  onClose: () => void;
}

export function ActionPlaceholderModal({
  action,
  visible,
  onClose,
}: ActionPlaceholderModalProps) {
  if (!action) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={action.iconName as any}
              size={36}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.title}>{action.title}</Text>
          <Text style={styles.description}>{action.description}</Text>

          <View style={styles.noticeBox}>
            <View style={styles.noticeHeader}>
              <Ionicons
                name="shield-outline"
                size={16}
                color={Colors.warning}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.noticeTitle}>Simulation Placeholder</Text>
            </View>
            <Text style={styles.noticeBody}>
              This action is a prototype placeholder. Interactive payment logic
              will be introduced in subsequent phases. No real financial operations
              or banking data are accessed.
            </Text>
          </View>

          <TouchableOpacity
            style={[CommonStyles.primaryButton, styles.closeButton]}
            activeOpacity={0.8}
            onPress={onClose}>
            <Text style={styles.closeButtonText}>Understood</Text>
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
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  noticeBox: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.warning,
  },
  noticeBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  closeButton: {
    width: '100%',
  },
  closeButtonText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
});
