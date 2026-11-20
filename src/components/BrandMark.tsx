import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

interface BrandMarkProps {
  size?: number;
  showGlow?: boolean;
}

export function BrandMark({ size = 72, showGlow = true }: BrandMarkProps) {
  const { colors } = useTheme();
  const containerSize = size;
  const radius = size * 0.28;

  return (
    <View style={[styles.wrapper, { width: containerSize, height: containerSize }]}>
      {showGlow && (
        <View
          style={[
            styles.glowRing,
            {
              width: containerSize + 12,
              height: containerSize + 12,
              borderRadius: (containerSize + 12) / 2,
              backgroundColor: colors.primaryGlow,
              borderColor: colors.borderLight,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.badge,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: radius,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.primary,
          },
        ]}>
        <View style={[styles.topAccent, { backgroundColor: colors.primary }]} />
        <View style={styles.contentRow}>
          <Text style={[styles.letterG, { fontSize: size * 0.42, color: colors.textPrimary }]}>G</Text>
          <Text style={[styles.dot, { fontSize: size * 0.28, color: colors.warning }]}>•</Text>
          <Text style={[styles.letterNu, { fontSize: size * 0.38, color: colors.primary }]}>ν</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  badge: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  letterG: {
    fontWeight: '900',
    letterSpacing: -1,
  },
  dot: {
    marginHorizontal: 1,
    fontWeight: '900',
  },
  letterNu: {
    fontWeight: '800',
    fontStyle: 'italic',
  },
});
