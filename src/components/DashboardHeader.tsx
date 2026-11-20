import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/theme';
import { BrandMark } from './BrandMark';
import { DemoBadge } from './DemoBadge';
import { useTheme } from '@/context/ThemeContext';

interface DashboardHeaderProps {
  userName: string;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onLock: () => void;
}

export function DashboardHeader({
  userName,
  onOpenProfile,
  onOpenNotifications,
  onLock,
}: DashboardHeaderProps) {
  const { colors } = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Demo Simulator Badge */}
      <View style={styles.badgeRow}>
        <DemoBadge label="INDEPENDENT DEMO WALLET SIMULATOR" />
      </View>

      {/* Main Header Bar */}
      <View style={styles.mainRow}>
        <View style={styles.brandGroup}>
          <BrandMark size={38} showGlow={false} />
          <View style={styles.titleColumn}>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>G Pay.nu</Text>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
              {getGreeting()}, <Text style={[styles.userName, { color: colors.primary }]}>{userName}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          {/* Lock Simulator Button */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={onLock}
            accessibilityLabel="Lock Simulator">
            <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            style={[
              styles.iconButton,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={onOpenNotifications}
            accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={19} color={colors.textSecondary} />
            <View style={[styles.notificationDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            style={[
              styles.avatarButton,
              {
                backgroundColor: colors.primary,
                borderColor: colors.borderLight,
                shadowColor: colors.primary,
              },
            ]}
            activeOpacity={0.8}
            onPress={onOpenProfile}
            accessibilityLabel="User Profile">
            <Text style={[styles.avatarText, { color: colors.textInverse }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleColumn: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 16,
  },
});
