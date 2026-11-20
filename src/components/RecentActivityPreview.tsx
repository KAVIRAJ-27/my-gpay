import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, CommonStyles } from '@/theme';
import { DemoTransactionRecord } from '@/services/database';
import { ContactAvatar } from './common/ContactAvatar';
import { useTheme } from '@/context/ThemeContext';

interface RecentActivityPreviewProps {
  activities: DemoTransactionRecord[];
  onSelectActivity: (activity: DemoTransactionRecord) => void;
  onViewAll: () => void;
}

export function RecentActivityPreview({
  activities,
  onSelectActivity,
  onViewAll,
}: RecentActivityPreviewProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Recent Activity
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
            Local SQLite transactions • Offline simulation
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          CommonStyles.card,
          styles.activityCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        {activities.length === 0 ? (
          <View style={styles.emptyRow}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color={colors.textTertiary}
            />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No simulated transactions yet
            </Text>
          </View>
        ) : (
          activities.slice(0, 4).map((item, index) => {
            const isCredit = item.type === 'credit';
            const isLast = index === Math.min(activities.length, 4) - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemRow,
                  !isLast && [styles.itemBorder, { borderBottomColor: colors.divider }],
                ]}
                activeOpacity={0.7}
                onPress={() => onSelectActivity(item)}>
                <ContactAvatar
                  name={item.recipient_name || 'Payment'}
                  size={42}
                />

                <View style={styles.detailsCol}>
                  <Text
                    style={[styles.itemTitle, { color: colors.textPrimary }]}
                    numberOfLines={1}>
                    {item.recipient_name}
                  </Text>
                  <Text
                    style={[styles.itemSubtitle, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {item.created_at_formatted}
                    {item.note ? ` • ${item.note}` : ''}
                  </Text>
                </View>

                <View style={styles.amountCol}>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color: isCredit ? colors.success : colors.textPrimary,
                      },
                    ]}>
                    {isCredit ? '+ ' : '- '}₹
                    {item.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <View
                    style={[
                      styles.simPill,
                      { backgroundColor: colors.badgeBackground },
                    ]}>
                    <Text style={[styles.simPillText, { color: colors.badgeText }]}>
                      SIMULATED
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityCard: {
    padding: 0,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  simPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  simPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyRow: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
