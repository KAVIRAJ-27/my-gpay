import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, BorderRadius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

interface DemoBadgeProps {
  label?: string;
}

export function DemoBadge({ label = 'INDEPENDENT DEMO WALLET SIMULATOR' }: DemoBadgeProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.badgeBackground,
          borderColor: colors.badgeBorder,
        },
      ]}>
      <Ionicons
        name="shield-checkmark-outline"
        size={12}
        color={colors.badgeText}
        style={styles.icon}
      />
      <Text style={[Typography.badge, { color: colors.badgeText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 6,
  },
});
