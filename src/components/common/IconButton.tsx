import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius } from '@/theme';
import { useTheme } from '@/context/ThemeContext';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border,
        },
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}>
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
