import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, CommonStyles } from '@/theme';

interface DemoBadgeProps {
  label?: string;
}

export function DemoBadge({ label = 'INDEPENDENT DEMO WALLET SIMULATOR' }: DemoBadgeProps) {
  return (
    <View style={CommonStyles.demoBadge}>
      <Ionicons
        name="shield-checkmark-outline"
        size={12}
        color={Colors.badgeText}
        style={styles.icon}
      />
      <Text style={[Typography.badge, { color: Colors.badgeText }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 6,
  },
});

