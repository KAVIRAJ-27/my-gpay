import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Biometric Security Active',
    body: 'Hardware-backed Android TEE Keyguard verified for this session.',
    time: 'Just now',
    icon: 'shield-checkmark',
    color: Colors.success,
  },
  {
    id: 'n2',
    title: 'Phase 3 Dashboard Initialized',
    body: 'Local demo wallet balance loaded: ₹24,850.00.',
    time: '5m ago',
    icon: 'wallet-outline',
    color: Colors.primary,
  },
  {
    id: 'n3',
    title: 'Simulation Notice',
    body: 'All quick actions and contacts operate in local sandbox mode.',
    time: '1h ago',
    icon: 'information-circle-outline',
    color: Colors.brandNu,
  },
];

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons
                name="notifications"
                size={20}
                color={Colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={Typography.title1}>Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {SAMPLE_NOTIFICATIONS.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: `${item.color}20`, borderColor: `${item.color}40` },
                  ]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.contentCol}>
                  <View style={styles.metaRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemBody}>{item.body}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[CommonStyles.primaryButton, styles.closeBtn]}
            onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
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
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    marginBottom: Spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  itemBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  closeBtn: {
    width: '100%',
  },
  closeBtnText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
