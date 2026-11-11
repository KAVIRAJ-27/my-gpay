import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/theme';

interface BrandMarkProps {
  size?: number;
  showGlow?: boolean;
}

export function BrandMark({ size = 72, showGlow = true }: BrandMarkProps) {
  const containerSize = size;
  const radius = size * 0.28;

  return (
    <View style={[styles.wrapper, { width: containerSize, height: containerSize }]}>
      {showGlow && (
        <View
          style={[
            styles.glowRing,
            {
              width: containerSize + 16,
              height: containerSize + 16,
              borderRadius: (containerSize + 16) / 2,
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
          },
        ]}>
        {/* Decorative inner gradient-style geometric accents */}
        <View style={styles.topAccent} />
        <View style={styles.contentRow}>
          <Text style={[styles.letterG, { fontSize: size * 0.42 }]}>G</Text>
          <Text style={[styles.dot, { fontSize: size * 0.28 }]}>•</Text>
          <Text style={[styles.letterNu, { fontSize: size * 0.38 }]}>ν</Text>
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
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
  },
  badge: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  letterG: {
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  dot: {
    color: Colors.brandNu,
    marginHorizontal: 1,
    fontWeight: '900',
  },
  letterNu: {
    fontWeight: '800',
    color: Colors.primary,
    fontStyle: 'italic',
  },
});
