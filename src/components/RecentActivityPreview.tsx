import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { DemoTransactionRecord } from '@/services/database';

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
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionSubtitle}>
            Local SQLite transactions • Offline simulation
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={[CommonStyles.card, styles.activityList]}>
        {activities.length === 0 ? (
          <View style={styles.emptyRow}>
            <Ionicons
              name="file-tray-outline"
              size={24}
              color={Colors.textTertiary}
            />
            <Text style={styles.emptyText}>No simulated transactions yet</Text>
          </View>
        ) : (
          activities.slice(0, 4).map((item, index) => {
            const isCredit = item.type === 'credit';
            const isLast = index === Math.min(activities.length, 4) - 1;

            let iconName = 'paper-plane-outline';
            if (item.category === 'topup') iconName = 'add-circle-outline';
            if (item.category === 'reset') iconName = 'refresh-outline';
            if (isCredit && item.category !== 'topup') iconName = 'arrow-down-circle-outline';

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemBorder]}
                activeOpacity={0.7}
                onPress={() => onSelectActivity(item)}>
                <View
                  style={[
                    styles.iconContainer,
                    isCredit ? styles.iconCredit : styles.iconDebit,
                  ]}>
                  <Ionicons
                    name={iconName as any}
                    size={20}
                    color={isCredit ? Colors.brandNu : Colors.primary}
                  />
                </View>

                <View style={styles.detailsCol}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.recipient_name}
                  </Text>
                  <Text style={styles.itemSubtitle} numberOfLines={1}>
                    {item.created_at_formatted}
                    {item.note ? ` • ${item.note}` : ''}
                  </Text>
                </View>

                <View style={styles.amountCol}>
                  <Text
                    style={[
                      styles.amountText,
                      isCredit ? styles.amountCredit : styles.amountDebit,
                    ]}>
                    {isCredit ? '+ ' : '- '}₹
                    {item.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                  <View style={styles.simPill}>
                    <Text style={styles.simPillText}>SIMULATED</Text>
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
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  viewAllText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  activityList: {
    padding: Spacing.none,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconDebit: {
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  iconCredit: {
    backgroundColor: 'rgba(16, 231, 195, 0.12)',
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.bodyBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    ...Typography.bodyBold,
    fontSize: 14,
    marginBottom: 2,
  },
  amountDebit: {
    color: Colors.textPrimary,
  },
  amountCredit: {
    color: Colors.brandNu,
  },
  simPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(0, 210, 255, 0.1)',
  },
  simPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  emptyRow: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
