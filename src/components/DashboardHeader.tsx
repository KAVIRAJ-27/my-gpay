import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme';
import { BrandMark } from './BrandMark';
import { DemoBadge } from './DemoBadge';

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
  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      {/* Top Demo Simulator Badge */}
      <View style={styles.badgeRow}>
        <DemoBadge label="INDEPENDENT DEMO WALLET SIMULATOR" />
      </View>

      {/* Main Header Bar */}
      <View style={styles.mainRow}>
        <View style={styles.brandGroup}>
          <BrandMark size={40} showGlow={false} />
          <View style={styles.titleColumn}>
            <Text style={styles.brandTitle}>G Pay.nu</Text>
            <Text style={styles.greetingText}>
              {getGreeting()}, <Text style={styles.userName}>{userName}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          {/* Lock Simulator Button */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={onLock}
            accessibilityLabel="Lock Simulator">
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications Button */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={onOpenNotifications}
            accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.8}
            onPress={onOpenProfile}
            accessibilityLabel="User Profile">
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
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
    backgroundColor: Colors.background,
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
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  greetingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    color: Colors.primary,
    fontWeight: '600',
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
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.primary,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    color: Colors.textInverse,
    fontWeight: '800',
    fontSize: 16,
  },
});
