import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, CommonStyles } from '@/theme';
import { DemoActivity } from '@/data/mockData';

interface RecentActivityPreviewProps {
  activities: DemoActivity[];
  onSelectActivity: (activity: DemoActivity) => void;
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
            Fictional sample records • Offline simulation
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={[CommonStyles.card, styles.activityList]}>
        {activities.slice(0, 4).map((item, index) => {
          const isReceived = item.type === 'received';
          const isLast = index === activities.slice(0, 4).length - 1;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, !isLast && styles.itemBorder]}
              activeOpacity={0.7}
              onPress={() => onSelectActivity(item)}>
              <View
                style={[
                  styles.iconContainer,
                  isReceived ? styles.iconReceived : styles.iconSent,
                ]}>
                <Ionicons
                  name={item.iconName as any}
                  size={20}
                  color={isReceived ? Colors.success : Colors.primary}
                />
              </View>

              <View style={styles.detailsCol}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {item.timestamp}
                </Text>
              </View>

              <View style={styles.amountCol}>
                <Text
                  style={[
                    styles.amountText,
                    isReceived ? styles.amountReceived : styles.amountSent,
                  ]}>
                  {isReceived ? '+ ' : '- '}₹
                  {item.amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
                <View style={styles.simPill}>
                  <Text style={styles.simPillText}>Demo</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  activityList: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconReceived: {
    backgroundColor: Colors.successSurface,
    borderWidth: 1,
    borderColor: Colors.successBorder,
  },
  iconSent: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailsCol: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountReceived: {
    color: Colors.success,
  },
  amountSent: {
    color: Colors.textPrimary,
  },
  simPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 3,
  },
  simPillText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
