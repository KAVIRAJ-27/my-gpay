import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/theme';
import { QuickActionItem } from '@/data/mockData';
import { useTheme } from '@/context/ThemeContext';

interface QuickActionsGridProps {
  actions: QuickActionItem[];
  onSelectAction: (action: QuickActionItem) => void;
}

export function QuickActionsGrid({ actions, onSelectAction }: QuickActionsGridProps) {
  const { colors } = useTheme();

  // Split into primary 4 and secondary actions
  const primaryActions = actions.slice(0, 4);
  const secondaryActions = actions.slice(4);

  return (
    <View style={styles.container}>
      {/* Primary 4 Google Pay style circular actions */}
      <View style={styles.primaryRow}>
        {primaryActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCol}
            activeOpacity={0.7}
            onPress={() => onSelectAction(action)}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}>
              <Ionicons
                name={action.iconName as any}
                size={24}
                color={colors.primary}
              />
            </View>
            <Text
              style={[styles.actionTitle, { color: colors.textPrimary }]}
              numberOfLines={2}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Secondary quick chips if available */}
      {secondaryActions.length > 0 && (
        <View style={styles.secondaryRow}>
          {secondaryActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onSelectAction(action)}>
              <Ionicons
                name={action.iconName as any}
                size={14}
                color={colors.primary}
              />
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  primaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  actionCol: {
    alignItems: 'center',
    width: '23%',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
