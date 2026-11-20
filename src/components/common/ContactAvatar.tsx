import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius } from '@/theme';

interface ContactAvatarProps {
  name: string;
  initials?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

const PASTEL_PALETTE = [
  { bg: '#E8F0FE', text: '#1A73E8' },
  { bg: '#FCE8E6', text: '#C5221F' },
  { bg: '#FEF7E0', text: '#B06000' },
  { bg: '#E6F4EA', text: '#137333' },
  { bg: '#F3E8FD', text: '#7627BB' },
  { bg: '#E0F2FE', text: '#0284C7' },
];

export function ContactAvatar({
  name,
  initials,
  size = 52,
  backgroundColor,
  textColor,
}: ContactAvatarProps) {
  // Derive deterministic color from name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % PASTEL_PALETTE.length;
  const palette = PASTEL_PALETTE[colorIndex];

  const derivedInitials =
    initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const finalBg = backgroundColor || palette.bg;
  const finalText = textColor || palette.text;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: finalBg,
        },
      ]}>
      <Text style={[styles.initials, { fontSize: size * 0.38, color: finalText }]}>
        {derivedInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
